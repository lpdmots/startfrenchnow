import { ElementProps, Extract } from "@/app/types/stories/element";
import { useStoryStore } from "@/app/stores/storiesStore";
import { useValidation } from "./useValidation";
import { Adventure } from "@/app/types/stories/adventure";
import { ChoiceProps, ElementDataProps, ElementsDataProps } from "@/app/types/stories/state";
import urlFor from "@/app/lib/urlFor";
import { useModifier } from "./useModifier";
import fetchData from "@/app/lib/apiStories";
import { ELEMENTDATA } from "@/app/lib/constantes";
import { rangeFromString } from "@/app/lib/utils";
import { ModifierWithRef } from "@/app/types/stories/effect";

export const useElementTreatment = () => {
    const { comonValidation } = useValidation();
    const { story, addElementsData, layouts, chapter, actualElementId, inheritedChoices: inheritedChoicesState } = useStoryStore();
    const { choicesValidation } = useValidation();
    const { effectsTreatment } = useModifier();
    const { durationTreatment } = useDuration();

    const choicesTreatment = async () => {
        const choices = [...(layouts.at(-1)?.interactionChoices || []), ...(layouts.at(-1)?.accessChoices || [])];
        const elementsData: ElementsDataProps = {}; // no need for global state, it's only used in this function to avoid unnecessary calculations.

        for (const choice of choices) {
            const elementData: ElementDataProps = { ...JSON.parse(JSON.stringify(ELEMENTDATA)) };
            const { elementId, effects, extracts, _id, duration } = choice;
            elementData.countIds.push(_id);

            // Free modifiers treatment:
            if (effects?.length) {
                await effectsTreatment({ effects }, elementData);
            }

            // Duration treatment
            durationTreatment(duration, elementData);

            // Free extracts treatment:
            if (extracts?.length) {
                await freeLayoutsData(choice, elementData);
                addElementsData(choice._id, elementData);
                elementData.elementId = "free-extract-" + actualElementId; // Préfixe pour éviter que sameElement soit true alors qu'il s'agit du parent, non de l'élément traité.
                elementsData[_id] = elementData;
                continue;
            }

            //Elements treatment only if no extracts, and copy the elementData only if no modifiers:
            if (elementId && !extracts?.length) {
                const sameElement = effects ? null : allreadyTreatedElement(elementId, elementsData);
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
        const firstElement = await fetchData<ElementProps>("element", elementId);
        const elements = await comonValidation("element", [firstElement], elementData);
        if (!elements) return console.warn("Aucun élément valide à traiter");

        const element = elements[0];
        elementData.countIds.push(element._id);
        elementData.elementId = element._id;

        const { extracts, duration } = element;
        if (!extracts) {
            console.warn(`L'élément "${element.code}" n'a pas d'extrait`);
            return null;
        }

        // Effects treatment
        await effectsTreatment(element, elementData);

        // Duration treatment
        durationTreatment(duration, elementData);

        // Selects the extracts that are valid and creates the layout data for each valid extract
        const validatedExtracts = await comonValidation("extract", extracts, elementData);
        await layoutsData(validatedExtracts as Extract[], element, elementData);
    };

    const layoutsData = async (validatedExtracts: Extract[], element: ElementProps, elementData: ElementDataProps) => {
        const choices = await getChoicesList(element);
        elementData.inheritedChoices = choices;
        const validatedChoices = await choicesValidation(choices, elementData);
        const step = elementData.step;

        const interactionChoices = step
            ? undefined
            : validatedChoices
                  .filter((choice) => choice?.nature === "interaction" || (!choice?.nature && choice?.element?.nature === "interaction"))
                  .map((choice) => ({
                      _id: choice._id,
                      elementId: choice?.element?._id,
                      code: choice?.element?.code || chapter,
                      label: choice.label || choice?.element?.label,
                      effects: choice.effects,
                      extracts: choice.extracts,
                      duration: choice.duration,
                      disabled: choice.disabled,
                  }));

        const accessChoices = step
            ? [step]
            : validatedChoices
                  .filter((choice) => choice?.nature === "access" || (!choice?.nature && choice?.element?.nature === "access"))
                  .map((choice) => ({
                      _id: choice._id,
                      elementId: choice?.element?._id,
                      code: choice?.element?.code || chapter,
                      label: choice.label || choice?.element?.label,
                      effects: choice.effects,
                      extracts: choice.extracts,
                      duration: choice.duration,
                      disabled: choice.disabled,
                  }));

        for (let i = 0; i < validatedExtracts.length; i++) {
            const extract = validatedExtracts[i];
            const isLastLayout = i === validatedExtracts.length - 1;

            const layoutData = {
                extractId: extract._id,
                fullScreenImage: !extract.content,
                image: await getImageUrl(extract, element, story),
                title: extract.title,
                text: extract.content,
                interactionChoices: isLastLayout ? interactionChoices : undefined,
                accessChoices: isLastLayout ? accessChoices : undefined,
                timer: extract.timer,
                informations: isLastLayout ? JSON.parse(JSON.stringify(elementData.informations)) : undefined,
            };
            elementData.layouts.push(layoutData);
            elementData.countIds.push(extract._id);
        }
    };

    const freeLayoutsData = async (choice: ChoiceProps, elementData: ElementDataProps) => {
        const { elementId, extracts, _id } = choice;
        if (!extracts) return;

        const validatedExtracts = await comonValidation("extract", extracts, elementData);
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
                },
            ];
        } else {
            await layoutsData(validatedExtracts || [], actualElement, elementData);
            return;
        }

        for (let i = 0; i < validatedExtracts.length; i++) {
            const extract = validatedExtracts[i];
            const isLastLayout = i === validatedExtracts.length - 1;

            const layoutData = {
                extractId: extract._id,
                fullScreenImage: !extract.content,
                image: await getImageUrl(extract, actualElement, story),
                title: extract.title,
                text: extract.content,
                interactionChoices: isLastLayout ? interactionChoices : undefined,
                accessChoices: isLastLayout ? accessChoices : undefined,
                timer: extract.timer,
                informations: isLastLayout ? JSON.parse(JSON.stringify(elementData.informations)) : undefined,
            };
            elementData.layouts.push(layoutData);
            elementData.countIds.push(extract._id);
        }
    };

    const getChoicesList = async (element: ElementProps) => {
        const choices = [...(element.choices || [])];
        const { choiceOptions } = element;
        const { access, interaction, inherit } = choiceOptions;

        const isInheritance = access || interaction || inherit;
        if (isInheritance || !choices.length) {
            try {
                let inheritedChoices;
                if (inherit) {
                    const inheritedElement = await fetchData<ElementProps>("element", inherit?._ref);
                    inheritedChoices = inheritedElement?.choices || [];
                } else {
                    inheritedChoices = inheritedChoicesState;
                }
                const filtredInheritedChoices =
                    (access && interaction) || (inherit && !access && !interaction)
                        ? inheritedChoices
                        : access
                        ? inheritedChoices.filter((choice) => choice?.element?.nature === "access")
                        : interaction
                        ? inheritedChoices.filter((choice) => choice?.element?.nature === "interaction")
                        : inheritedChoices;
                choices.push(...filtredInheritedChoices);
            } catch (e) {
                console.warn("Element fetch error:", e);
            }
        }
        return choices;
    };

    return { elementTreatment, layoutsData, choicesTreatment };
};

export const getImageUrl = async (extract: any, element: ElementProps | null, story: Adventure | null) => {
    if (extract.textOnly) return undefined;
    if (extract.image) return urlFor(extract.image).url();
    if (extract.imageInheritance) {
        try {
            const elementInheritance = await fetchData<ElementProps>("element", extract.imageInheritance._ref);
            if (elementInheritance?.image) return urlFor(elementInheritance.image).url();
        } catch (e) {
            console.warn("Element fetch error:", e);
        }
    }
    if (element?.image) return urlFor(element.image).url();

    const storyImages = story?.images.secondary;
    if (!storyImages) return undefined;
    return urlFor(storyImages[Math.floor(Math.random() * story?.images.secondary.length)]).url();
};

const allreadyTreatedElement = (elementId: string, elementsData: ElementsDataProps) => {
    return Object.values(elementsData).find((elementData) => elementData.elementId && elementData.elementId === elementId);
};

export const getDurationToNumber = (duration: string) => {
    const durationToList = duration.split(",").map((d) => d.trim());
    const optionsList = [];

    for (const duration of durationToList) {
        if (duration.includes("/")) {
            const range = rangeFromString(duration);
            optionsList.push(...range);
        } else {
            !isNaN(parseInt(duration)) && optionsList.push(parseInt(duration));
        }
    }

    return optionsList[Math.floor(Math.random() * optionsList.length)];
};

export const useDuration = () => {
    const { applyModifier } = useModifier();

    const durationTreatment = (duration: string | undefined, elementData: ElementDataProps) => {
        if (!duration) return;

        const durationToNumber = getDurationToNumber(duration);
        const durationModifier: ModifierWithRef = {
            variables: null,
            references: ["time"],
            operator: "addition",
            access: [],
            arguments: durationToNumber.toString(),
            code: "100",
        };

        applyModifier({ modifiers: [durationModifier] }, elementData);
    };

    return { durationTreatment };
};
