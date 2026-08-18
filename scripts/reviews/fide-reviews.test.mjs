import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

let sortFideReviews;
let getFideReviewCertificateUrl;
let ReviewAvatar;

try {
    ({ sortFideReviews, getFideReviewCertificateUrl } = await import("../../app/lib/fideReviews.mjs"));
} catch {
    sortFideReviews = undefined;
    getFideReviewCertificateUrl = undefined;
}

try {
    ({ ReviewAvatar } = await import("../../app/components/common/ReviewAvatar.mjs"));
} catch {
    ReviewAvatar = undefined;
}

test("featured reviews stay ahead of newer dated reviews", () => {
    assert.equal(typeof sortFideReviews, "function", "sortFideReviews must be implemented");

    const sortedNames = sortFideReviews([
        { userName: "Newest", date: 3 },
        { userName: "Featured older", date: 1, featured: true },
        { userName: "Middle", date: 2 },
    ]).map(({ userName }) => userName);

    assert.deepEqual(sortedNames, ["Featured older", "Newest", "Middle"]);
});

test("review sorting does not mutate the shared source list", () => {
    assert.equal(typeof sortFideReviews, "function", "sortFideReviews must be implemented");

    const reviews = [
        { userName: "Older", date: 1 },
        { userName: "Newer", date: 2 },
    ];

    sortFideReviews(reviews);

    assert.deepEqual(reviews.map(({ userName }) => userName), ["Older", "Newer"]);
});

test("local result images stay local while legacy keys use CloudFront", () => {
    assert.equal(typeof getFideReviewCertificateUrl, "function", "getFideReviewCertificateUrl must be implemented");

    assert.equal(getFideReviewCertificateUrl("/images/fide/reviews/javier-result.webp", "https://cdn.example.com/"), "/images/fide/reviews/javier-result.webp");
    assert.equal(getFideReviewCertificateUrl("fide/certificats/legacy.png", "https://cdn.example.com/"), "https://cdn.example.com/fide/certificats/legacy.png");
});

test("review avatars render in a fixed square with circular clipping", () => {
    assert.equal(typeof ReviewAvatar, "function", "ReviewAvatar must be implemented");

    const markup = renderToStaticMarkup(React.createElement(ReviewAvatar, null, React.createElement("span", null, "avatar")));

    assert.match(markup, /h-\[100px\]/);
    assert.match(markup, /w-\[100px\]/);
    assert.match(markup, /rounded-full/);
    assert.match(markup, /overflow-hidden/);
});

test("compact review avatars remain square", () => {
    assert.equal(typeof ReviewAvatar, "function", "ReviewAvatar must be implemented");

    const markup = renderToStaticMarkup(React.createElement(ReviewAvatar, { size: "compact" }, React.createElement("span", null, "avatar")));

    assert.match(markup, /h-14/);
    assert.match(markup, /w-14/);
});

test("review avatar geometry does not depend on Tailwind scanning the module", () => {
    assert.equal(typeof ReviewAvatar, "function", "ReviewAvatar must be implemented");

    const markup = renderToStaticMarkup(React.createElement(ReviewAvatar, null, React.createElement("span", null, "avatar")));

    assert.match(markup, /width:100px/);
    assert.match(markup, /height:100px/);
    assert.match(markup, /border-radius:9999px/);
    assert.match(markup, /overflow:hidden/);
});

test("every supplied FIDE review image has a publishable web asset", async () => {
    const assets = [
        "public/images/fide/reviews/paula.webp",
        "public/images/fide/reviews/javier-result.webp",
        "public/images/fide/reviews/murat-result.webp",
        "public/images/fide/reviews/selahattin-result.webp",
    ];

    await Promise.all(assets.map((asset) => access(new URL(`../../${asset}`, import.meta.url))));
});
