import { Block, Slug } from "./blog";

type Base = {
    _createdAt: string;
    _id: string;
    _rev: string;
    _type: string;
    _updatedAt: string;
};

export interface Video extends Base {
    title: string;
    description: string;
    body: Block[];
    slug: Slug;
    s3Key: string;
    level: "a1" | "a1Plus" | "a2" | "a2Plus";
    categorie: string;
    duration: Number;
    display: "primary" | "secondary" | "hidden";
    price: Number;
    reduction: Number;
    order: Number;
}
