import type { DefaultDocumentNodeResolver } from "sanity/desk";
import StudioPreviewPane from "@/app/components/sanity/StudioPreviewPane";

export const getDefaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
    if (schemaType === "post") {
        return S.document().views([
            S.view.form(),
            S.view.component(StudioPreviewPane).title("Preview"),
        ]);
    }
};
