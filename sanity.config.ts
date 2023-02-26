import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { myTheme } from "./themeSanity";
import StudioNavBar from "./app/components/sanity/StudioNavBar";
import Logo from "./app/components/sanity/Logo";
import { getDefaultDocumentNode } from "./structure";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineConfig({
    basePath: "/studio",
    name: "I_don_t_speak_French",
    title: "Start French now",
    projectId,
    dataset,

    plugins: [
        deskTool({
            defaultDocumentNode: getDefaultDocumentNode,
        }),
        visionTool(),
    ],

    schema: {
        types: schemaTypes,
    },
    studio: {
        components: {
            logo: Logo,
            navbar: StudioNavBar,
        },
    },
    theme: myTheme,
});
