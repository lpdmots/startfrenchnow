import { ElementProps, Extract } from "@/app/types/stories/element";
import { useStoryStore } from "@/stores/storiesStore";
import { useValidation } from "./useValidation";
import { Adventure } from "@/app/types/stories/adventure";
import { ChoiceProps, ElementDataProps, ElementsDataProps } from "@/app/types/stories/state";
import urlFor from "@/lib/urlFor";
import { useModifier } from "./useModifier";
import fetchData from "@/lib/apiStories";

export const useElementTreatment = () => {
    const { comonValidation } = useValidation();
    const { story, addElementsData, layouts, chapter, actualElementId } = useStoryStore();
    const { choicesValidation } = useValidation();
    const { effectsTreatment } = useModifier();

    const choicesTreatment = async () => {
        const choices = [...(layouts.at(-1)?.interactionChoices || []), ...(layouts.at(-1)?.accessChoices || [])];
        const elementsData: ElementsDataProps = {}; // no need for global state, it's only used in this function to avoid unnecessary calculations.

        for (const choice of choices) {
            const elementData: ElementDataProps = { elementId: actualElementId, variablesToUpdate: {}, layouts: [], heros: {}, countIds: [], access: {}, step: null };
            const { elementId, modifiers, extracts, _id } = choice;
            elementData.countIds.push(_id);

            // Free modifiers treatment:
            if (modifiers?.length) {
            }

            // Free extracts treatment:
            if (extracts?.length) {
                await freeLayoutsData(choice, elementData);
                addElementsData(choice._id, elementData);
                elementsData[_id] = elementData;
                continue;
            }

            //Elements treatment only if no extracts, and copy the elementData only if no modifiers:
            if (elementId && !extracts?.length) {
                const sameElement = modifiers ? null : allreadyTreatedElement(elementId, elementsData);
                if (sameElement) {
                    addElementsData(choice._id, sameElement);
                    elementsData[_id] = sameElement;
                } else {
                    await elementTreatment(elementId, elementData);
                    addElementsData(choice._id, elementData);
                    elementsData[_id] = elementData;
                }
            }
        }
    };

    const elementTreatment = async (elementId: string, elementData: ElementDataProps) => {
        const element = await fetchData<ElementProps>("element", elementId);
        elementData.countIds.push(elementId);
        elementData.elementId = elementId;

        const { extracts } = element;
        if (!extracts) {
            console.warn(`L'élément "${element.code}" n'a pas d'extrait`);
            return null;
        }

        // Effects treatment
        await effectsTreatment(element, elementData);

        // Selects the extracts that are valid and creates the layout data for each valid extract
        const validatedExtracts = await comonValidation("extract", extracts, elementData);
        await layoutsData(validatedExtracts as Extract[], element, elementData);
    };

    const layoutsData = async (validatedExtracts: Extract[], element: ElementProps, elementData: ElementDataProps) => {
        console.log({ element });
        const validatedChoices = await choicesValidation(element.choices, elementData);
        const step = elementData.step;

        const interactionChoices = step
            ? undefined
            : validatedChoices
                  .filter((choice) => choice?.element?.nature === "interaction" || choice?.extracts?.length)
                  .map((choice) => ({
                      _id: choice._id,
                      elementId: choice?.element?._id,
                      code: choice?.element?.code || chapter,
                      label: choice.label || choice?.element?.name || "arrow",
                      modifiers: choice.modifiers,
                      extracts: choice.extracts,
                  }));

        const accessChoices = step
            ? [step]
            : validatedChoices
                  .filter((choice) => choice?.element?.nature === "access")
                  .map((choice) => ({
                      _id: choice._id,
                      elementId: choice?.element?._id,
                      code: choice?.element?.code || chapter,
                      label: choice.label || choice?.element?.name || "arrow",
                      modifiers: choice.modifiers,
                      extracts: choice.extracts,
                  }));

        for (let i = 0; i < validatedExtracts.length; i++) {
            const extract = validatedExtracts[i];
            const isLastLayout = i === validatedExtracts.length - 1;

            const layoutData = {
                extractId: extract._id,
                fullScreenImage: !extract.content,
                image: getImageUrl(extract, element, story),
                title: extract.title,
                text: extract.content,
                interactionChoices: isLastLayout ? interactionChoices : undefined,
                accessChoices: isLastLayout ? accessChoices : undefined,
                timer: extract.timer,
            };
            elementData.layouts.push(layoutData);
            elementData.countIds.push(extract._id);
        }
    };

    const freeLayoutsData = async (choice: ChoiceProps, elementData: ElementDataProps) => {
        const { elementId, extracts, _id } = choice;
        if (!extracts) return;

        const actualElement = await fetchData<ElementProps>("element", actualElementId);
        const step = elementData.step;
        let interactionChoices, accessChoices;

        if (step) {
            interactionChoices = undefined;
            accessChoices = [step];
        } else if (elementId) {
            interactionChoices = undefined;
            accessChoices = [
                {
                    _id,
                    elementId,
                    code: chapter,
                    label: "arrow",
                },
            ];
        } else {
            await layoutsData(extracts || [], actualElement, elementData);
            return;
        }

        for (let i = 0; i < extracts.length; i++) {
            const extract = extracts[i];
            const isLastLayout = i === extracts.length - 1;

            const layoutData = {
                extractId: extract._id,
                fullScreenImage: !extract.content,
                image: getImageUrl(extract, actualElement, story),
                title: extract.title,
                text: extract.content,
                interactionChoices: isLastLayout ? interactionChoices : undefined,
                accessChoices: isLastLayout ? accessChoices : undefined,
                timer: extract.timer,
            };
            elementData.layouts.push(layoutData);
            elementData.countIds.push(extract._id);
        }
    };

    return { elementTreatment, layoutsData, choicesTreatment };
};

export const getImageUrl = (extract: any, element: ElementProps | null, story: Adventure | null) => {
    if (extract.textOnly) return undefined;
    if (extract.image) return urlFor(extract.image).url();
    if (element?.image) return urlFor(element.image).url();

    const storyImages = story?.images.secondary;
    if (!storyImages) return undefined;
    return urlFor(storyImages[Math.floor(Math.random() * story?.images.secondary.length)]).url();
};

const allreadyTreatedElement = (elementId: string, elementsData: ElementsDataProps) => {
    return Object.values(elementsData).find((elementData) => elementData.elementId === elementId);
};
