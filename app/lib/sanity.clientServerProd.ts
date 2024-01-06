import { createClient } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET_PROD;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
const token = process.env.SANITY_API_TOKEN;

export const SanityServerClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
});
