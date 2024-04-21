import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/lib/sanity.client";
import { Choice, ElementProps, Extract } from "@/app/types/stories/element";
import { groq } from "next-sanity";
import { Block } from "@/app/types/sfn/blog";

const query = groq`
    *[_type == "element" && code == $code && adventure._ref == "9d9e0112-482c-4a8b-a9a8-c5f70b99d2ce" ][0]{ 
        _id,
        code,
        name,
        label,
        extracts[]->,
        choices[]->{
            _id,
            label,
            extracts[]->,
            antagonistes
        }
    }
`;

const queryChoice = groq`
    *[_type == "choice" && _id == $_ref][0]{ 
        _id,
        label,
        extracts[]->,
        antagonistes
    }
`;

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const IDSLIST: string[] = [
    "604457e7-5f20-4f8b-aee2-1791fa77e764",
    "fb96ebf1-0be0-4f0c-a7dd-8bf27e06d38c",
    "66b36998-6d04-4c4f-ad56-257ba0858521",
    "c241342c-3f30-43af-9cea-87082afc8ae3",
    "8202f605-1c21-4b26-8e43-c17564e41a72",
    "d956c2f6-4740-4752-b97c-7ae7eb6f440f",
    "ff4c18b2-df7d-438c-b87d-a283a481c2b1",
    "604457e7-5f20-4f8b-aee2-1791fa77e764",
    "fb96ebf1-0be0-4f0c-a7dd-8bf27e06d38c",
    "66b36998-6d04-4c4f-ad56-257ba0858521",
    "c241342c-3f30-43af-9cea-87082afc8ae3",
    "8202f605-1c21-4b26-8e43-c17564e41a72",
    "d956c2f6-4740-4752-b97c-7ae7eb6f440f",
    "5fcebebe-b510-4c8c-8550-7071122ff3cb",
    "2697040e-5475-4893-bc1a-faa537fe8c0a",
    "2720e9b5-a076-4e9c-b89f-d7b6835a0499",
    "e5865818-4059-4123-80d5-af62c7d7ee79",
    "0b2ee815-93b4-482a-95b3-462b569826c5",
    "57874ca7-1b0e-4041-830a-85c1cd83bbc0",
    "ffd2278a-411e-4605-909c-95de2c3e5bdc",
    "6a566ffb-68f5-42ed-b267-692c2a41236f",
    "332b91bf-6c06-45e6-b923-161e73fd1e74",
    "0c3c4131-7ff8-4ccf-972d-e415ad6749d6",
    "5f13ab67-e197-4c84-a8b7-4b9713c97ac4",
    "e2fcba00-1709-4df2-a62f-54d6093c4684",
    "4892aba3-4990-4c16-b7c9-3fd8c02d0ad8",
    "957fb7ad-26cc-440d-8f69-d7cbb5bc5145",
    "98fdb96b-cf5f-4a97-adb3-337292bdc463",
    "57bbf52e-d206-416f-8eb4-c65b7950e8b5",
    "c6babdf7-2a84-40a8-9c1a-4744e06e40ed",
    "63232acc-544d-477c-9043-aafd382e93f2",
    "e1b6fec2-41f0-4b4e-b7c3-857a7a99f039",
    "6b89bf1c-7a5a-4505-a6fc-f60628c9b951",
    "6ee1d62b-c7ec-4ebd-ad2d-e4bf6e078e1e",
    "da0576e2-26b2-4ef3-b84b-77dc1fdfc6a1",
    "86ab70c6-e7af-44cb-9f37-9adf42792467",
    "841432c2-5a76-42e3-8b0c-38a28afcc45a",
    "0855bdc5-ab73-474c-a700-8d75ea0d14ec",
    "a4d2e9c3-012e-4048-930b-5ca83c7bd02d",
    "889a2665-f902-425d-8f9c-1ff3580aaee0",
    "18d93e01-6da1-43e9-a1c5-ba1e529609cd",
    "dc537a5b-088c-47f5-8778-51a406533ecb",
    "f1f7d4e4-1b5f-445c-9409-e0a19889b3fb",
    "39b007d2-6184-43dd-beb4-d3763c3ca173",
    "c07872ab-08b3-4df9-b24d-ed63479db4a8",
    "44e75a7b-bd00-42ac-a12a-426235909537",
    "1cf50106-1664-4a77-b32d-4bbd3b8c721e",
    "0737db0f-0656-44c4-bd96-a17aabb402a2",
    "a1c7fe7e-a58c-44e2-80ce-1d4be94144e4",
    "bc13035f-5d05-4ab4-997b-3242fc78141d",
    "9807d066-0783-492b-a821-627b6bbae66b",
    "e2b5e80d-9248-40ce-9525-5685200ff0a7",
    "1126d298-d2ac-4c26-9243-b467c3c7e643",
    "c686c678-c3db-4ef2-bb5c-bf750da1f801",
    "6e7fbb40-fa6f-4e65-a3a3-1cf532242d3c",
    "b9a15447-bc16-4eaf-b4eb-5eb0024abf50",
    "328b9965-1a2b-4154-9964-bb98beea3f2a",
    "f7bbfc6b-51b6-4098-bbcf-fd1e938574f6",
    "01e08f9d-9573-459c-bb55-22764fdcd53b",
    "c8b4f154-37a6-4942-bbe4-bf7d201fc6b5",
    "3d795b53-ffd5-4474-bf06-6f8383e1f13e",
    "8e15f47a-70fa-4cc2-a214-acd6e86b18c7",
    "f32de17d-c147-44f0-ac50-004f543b2b9f",
    "72cf5ac0-338f-40c9-ab0b-3834a6ada372",
    "bdad0250-62a2-43e0-b5ae-5437040c2e67",
    "0bef90f8-75be-4025-826e-c60c77be5bba",
    "9471e44b-8787-4050-8a2b-39b8ebc85cf6",
    "f7776df6-d04f-4ee3-80a6-714c894102a9",
    "c06844bf-0a01-42c9-bd7b-ed2341bfb739",
    "8b7ddb9a-4351-41dd-ae47-646e59ade640",
    "77826578-55dd-4774-9d71-0d05b70f1b1a",
    "f0f3bfec-a451-4104-befa-f505266a6863",
    "10ed023c-a03f-481e-9d6e-dbf4196bcc40",
    "a034538d-a0a3-4806-bdb8-8a9a04ba71d5",
    "a3bb501e-f68f-4985-82e9-210bc79c0988",
    "ea4721e6-a747-44b8-a87b-51f4cd8faea0",
    "c67f7ab0-2a8e-465a-aafd-72408baee7cf",
    "35b4301f-a18e-4686-b173-62069c8a0a51",
    "56d46075-8f8d-4119-bf3c-d9bba72d1c5c",
    "e5cdf225-f669-4fbd-bf37-12784bee6943",
    "d5e1ccb9-8faa-40ff-86f4-8460a769dd0d",
    "6cb1ae32-eb8e-4539-a171-95bff0fad2b7",
    "69f8567b-19fb-4633-8ef1-8bd24e2185b9",
    "e279ebf5-f136-40f6-8f49-758dcc37c8e2",
    "0463fa56-af7e-4090-9a7e-f364a778a927",
    "8557ac49-8fcc-4335-83e1-1fb184c48707",
    "399b5c4a-8120-49cc-8c48-2560aa2c72a4",
    "26a5fd2a-9e14-4ef1-b174-98a6fc971eb9",
    "29dbfb43-85e4-4421-8ee1-fbaef956c4e0",
    "b1a10438-c588-4ec4-8c28-b2bf28738c96",
    "e8da395f-2397-4d78-8207-b547e40f51b5",
    "0ae10aa9-2ae0-4723-9cc8-bc49ae301e3e",
    "78996927-17d9-4342-8182-9fdb2a723c9c",
    "79cf6641-d130-4186-a150-49cf67f8ed0b",
    "3ec4493a-ff87-4ce5-aecf-7ae5be0c04b1",
    "6311757e-7117-4fd4-bb0d-49ffdf62b0f1",
    "9bab3c61-6b73-4cfc-b1b6-e6a91a57d9f4",
    "42572b5d-b158-41c5-9dd3-548305673538",
    "b1b858bb-d7b2-48c4-bd46-984d06c56ac7",
    "128bb3c2-cecd-4d63-a402-942fb5cd9842",
    "3ae54d44-fcf3-4848-b503-77d01784b50f",
    "4d9f2b4e-9720-4a97-8a1e-343a7ce46b9b",
    "5e0d8eee-a870-48e6-8248-77912df3ea3a",
    "e7119692-61c0-4daa-823d-203b4e2bbc8f",
    "fe49c21e-0a1b-473d-a2d0-875d851aa426",
    "594990de-1355-4f9c-baee-bf4cd66469db",
    "e536fc35-5c38-4e4a-828b-265d4a502c27",
    "4beeabca-f217-48eb-b9b3-73931a77b1f4",
    "51681cf3-b994-4625-9a48-f02620d1b640",
    "ca518039-9c09-4650-a523-7f86848403c4",
    "1f15209e-fae2-4ab2-9fef-5143fe0b3554",
    "4c2e415a-570f-475e-982c-72f80ae1e410",
    "e807136e-66ca-41a3-8d23-bcdf73d25e62",
    "956e7db7-9406-4a7d-b978-38cb83fd2abf",
    "f299f2e9-a658-474c-b234-051d49802f2c",
    "9dd21f25-4ad2-4fe1-acf7-eecaf97e4981",
    "1aaeeb3f-7721-4349-8727-9eb307c72ee0",
    "02c110ea-5b96-4cf6-b674-bd644b351502",
    "e6afebe0-6d04-4edf-a185-33bb73e7ac80",
    "87cc2b6d-73d6-4072-91e1-61a4b22f601d",
    "b09e05b7-db96-41fd-aec6-aff09f8fb839",
    "02c71177-e751-464c-aee8-1d3f0353bba1",
    "32a3296d-8266-442d-a4bb-5d63f522fb29",
    "d1ae940e-41b4-4a2c-937d-9745f91e2c17",
    "9d92a95c-6459-48d5-93d3-9e5e74d7c20d",
    "92a12c16-4b17-4133-83be-e76c8a1a2cc9",
    "98125f96-a138-4509-b5a4-b168930c4fd8",
    "e0db5699-cca0-466d-9757-67be05f4f225",
    "684824a4-8c14-4f61-9290-21d4b83e7b48",
    "57d4c1d4-2c0b-4d0c-bb8e-fe9b5907fbb3",
    "a63b9a41-d4d4-4948-9c36-02c6ac99ea2d",
    "cd0ff36f-1381-413e-8577-457d5922a3e2",
    "201e7d31-931e-4d61-a04c-00a239c64b08",
    "d7bae69f-fc97-4e0e-aa13-e196ad531606",
    "09bed788-9623-4e0f-a7b0-f9799411d1c2",
    "958ded18-8c2e-42dd-9e43-2759f62c7cfc",
    "d4787925-2bd6-49d8-bbee-bbd31b42f665",
    "6bbb5567-bdc3-4a24-ba3f-079535ce9820",
    "0ebd1bf5-fee6-4d90-ad24-40334623d8c6",
    "e235f675-bf91-4bec-92f2-cb885e1e5694",
    "0d58dc7e-551b-44be-add6-dfe121e8f119",
    "85851832-f16d-44cc-83b3-588810a4de01",
    "77d85587-b440-4a5c-823c-5c12abf09532",
    "4d7c727b-95b4-43f4-8352-4c57462a1e9e",
    "c45ef7cd-479a-4e95-89ad-5f2eec19af2d",
    "e5376df4-6dfd-44a9-bf89-0c124d619f9c",
    "f40fbbf3-0429-4a22-93b3-01590feaa94a",
    "9809b2d0-3a07-4f37-906e-33262d7b8012",
    "ba1f614e-9ed2-4c82-99f0-9e9e87660e37",
    "104e162e-3dd0-46e6-a713-7667ac7b1f5b",
    "fad2fdda-c403-4165-bd1d-38c8e6db1e96",
    "d5483fa7-acd4-4b9b-9405-7deb9bda9b1b",
    "b157fe39-b8c8-4c65-bf54-be2b6e959a41",
    "e20816f8-9ed5-43e9-8c57-2a4ac860a72a",
    "6e6ddb85-0689-4a1a-be36-689a344b4773",
    "fe1ac871-b708-47f5-9080-86cf52184d99",
    "3ff2a4bf-9135-452e-af07-149440505cdb",
    "512064ca-64a4-4076-979d-9e135e668098",
    "43b97c18-2371-46e2-96c2-768f560c3d0c",
    "13c93c31-ce1c-4de5-a552-5f5e4ac16336",
    "cbd75696-d4b7-4f87-8f8b-1f9c7f35fc0b",
    "61a000ca-b116-4359-9639-e724a8db22d5",
    "7747f4c8-be63-4c33-9d6b-8b2b06949172",
    "39738d2f-27de-49f8-819f-d2f958de999d",
    "5f7014fd-9f11-4619-96f6-d47939030c97",
    "262325d1-dc5b-4cd1-aec1-8b5f95245a8a",
    "ad889c13-ff50-40be-990e-9467ade5c31f",
];

export async function GET(req: NextRequest) {
    const secret_key = req.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.replaceAll("_", ".");

    if (!code) return NextResponse.json({ message: "Missing code" }, { status: 400 });

    try {
        const element: ElementProps | Choice = await client.fetch(query, { code });
        if (!element) return NextResponse.json({ message: "Component not found" }, { status: 404 });
        const data: any = { ...element, label: extractTextRecursively(element.label || []) };
        data.extracts = await collectAllExtracts(data.extracts || []);
        data.choices = await collectAllChoices(data.choices || []);
        const ids = [...IDSLIST, ...data.extracts.map((extract: SimpleExtract) => extract._id), ...data.choices.map((choice: SimpleChoice) => choice._id)];
        return NextResponse.json({ data, ids });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

interface SimpleExtract {
    _id: string;
    content: string;
}

async function collectAllExtracts(initialExtracts: Extract[]) {
    // Initialiser la liste résultante des extracts
    let allExtracts: SimpleExtract[] = [];

    // Utiliser une file d'attente pour gérer les extracts à traiter
    let queue = [...(initialExtracts || [])]; // Commencer avec les extracts initiaux

    // Boucler tant qu'il reste des extracts à traiter
    while (queue.length > 0) {
        // Retirer le premier extract de la file d'attente
        let currentExtract = queue.shift();

        if (currentExtract) {
            // Ajouter l'extract courant à la liste des résultats
            if (!IDSLIST.includes(currentExtract._id)) allExtracts.push(getSimpleExtract(currentExtract));

            // Vérifier si l'extract courant a des antagonistes
            if (currentExtract.antagonistes && currentExtract.antagonistes.length > 0) {
                // Pour chaque antagoniste, résoudre la référence à un extract et l'ajouter à la file d'attente
                for (let antagonist of currentExtract.antagonistes) {
                    let { _ref } = antagonist;
                    // Supposition: resolveReference est une fonction qui résout une référence en un objet Extract
                    let antagonisteExtract = await client.fetch(`*[_type == "extract" && _id == $_ref][0]`, { _ref });

                    if (antagonisteExtract) {
                        queue.unshift(antagonisteExtract); // Ajouter à la file pour traitement ultérieur
                    }
                }
            }
        }
    }

    return allExtracts;
}

const getSimpleExtract = (extract: Extract) => {
    const { _id, content } = extract;
    const simpleContent = extractTextRecursively(content);
    return { _id, content: simpleContent };
};

type Span = {
    _type: "span";
    marks?: string[];
    text: string;
};

// Fonction pour extraire récursivement le texte
function extractTextRecursively(blocks: (Span | Block)[]): string {
    return blocks
        ?.map((blockOrSpan) => {
            // Cas où l'élément est un Span, retourner directement le texte
            if (blockOrSpan._type === "span") {
                return blockOrSpan.text;
            }

            // Cas où l'élément est un Block, extraire récursivement le texte de ses enfants
            if (blockOrSpan._type === "block") {
                return extractTextRecursively(blockOrSpan.children);
            }

            return "";
        })
        .join("");
}

interface SimpleChoice {
    _id: string;
    label?: string;
    extracts: SimpleExtract[];
}

async function collectAllChoices(initialChoices: Choice[]) {
    // Initialiser la liste résultante des choices
    let allChoices: SimpleChoice[] = [];

    // Utiliser une file d'attente pour gérer les choices à traiter
    let queue = [...initialChoices]; // Commencer avec les choices initiaux

    // Boucler tant qu'il reste des choices à traiter
    while (queue.length > 0) {
        // Retirer le premier choice de la file d'attente
        let currentChoice = queue.shift();

        if (currentChoice) {
            // Ajouter le choice courant à la liste des résultats
            if (!IDSLIST.includes(currentChoice._id)) allChoices.push(await getSimpleChoice(currentChoice));

            // Vérifier si le choice courant a des antagonistes
            if (currentChoice.antagonistes && currentChoice.antagonistes.length > 0) {
                // Pour chaque antagoniste, résoudre la référence à un choice et l'ajouter à la file d'attente
                for (let antagonist of currentChoice.antagonistes) {
                    let { _ref } = antagonist;
                    // Supposition: resolveReference est une fonction qui résout une référence en un objet Choice
                    let antagonisteChoice = await client.fetch(queryChoice, { _ref });

                    if (antagonisteChoice) {
                        queue.unshift(antagonisteChoice); // Ajouter à la file pour traitement ultérieur
                    }
                }
            }
        }
    }

    return allChoices;
}

const getSimpleChoice = async (choice: Choice) => {
    const { _id, label, extracts } = choice;
    const simpleLabel = label ? extractTextRecursively(label) : undefined;
    const simpleExtracts = await collectAllExtracts(extracts || []);
    return { _id, label: simpleLabel, extracts: simpleExtracts };
};
