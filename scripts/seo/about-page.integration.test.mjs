import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const socialUrls = [
    "https://www.udemy.com/user/yohann-coussot/",
    "https://www.youtube.com/@startfrenchnow",
    "https://www.instagram.com/startfrenchnow/",
    "https://www.tiktok.com/@startfrenchnow",
];

const locales = [
    {
        name: "English",
        path: "/about",
        fidePath: "/fide",
        title: "Yohann Coussot | French Teacher and FIDE Preparation",
        hobbyTitles: ["Languages", "Travel", "Running", "Mountains", "Series & films", "Croissants", "Going out"],
    },
    {
        name: "French",
        path: "/fr/about",
        fidePath: "/fr/fide",
        title: "Yohann Coussot | Professeur de français et préparation FIDE",
        hobbyTitles: ["Langues", "Voyages", "Course à pied", "Montagne", "Séries & Films", "Croissants", "Sorties"],
    },
];

for (const locale of locales) {
    test(`${locale.name} About page combines personal identity, verified proof, and localized hobbies`, async () => {
        const response = await fetch(`${baseUrl}${locale.path}`);
        const document = new JSDOM(await response.text()).window.document;
        const h1 = document.querySelector("h1");
        const proof = document.querySelector("[data-about-proof]");
        const hobbies = document.querySelector("[data-about-hobbies]");
        const story = document.querySelector("#My-Story");

        assert.equal(response.status, 200);
        assert.equal(document.title, locale.title);
        assert.equal(h1?.textContent?.replace(/\s+/g, " ").trim(), "Enchanté, moi c'est Yohann");
        assert.equal(document.querySelectorAll("h1").length, 1);

        assert.ok(story, "the personal story section must be present");
        assert.ok(story.classList.contains("section"));
        assert.ok(!story.classList.contains("pd-top-0"), "the personal story must retain the standard section top spacing");

        assert.ok(proof, "the page must expose a visible professional proof section");
        const proofText = proof.textContent?.replace(/\s+/g, " ") || "";
        assert.match(proofText, /16/);
        assert.match(proofText, /8/);
        assert.match(proofText, /300\+/);
        assert.match(proofText, /98\s?%/);
        assert.match(proofText, /60(?:[,.\s])?000/);
        const fideCta = proof.querySelector(`a[href="${locale.fidePath}"]`);
        assert.ok(fideCta, "the proof section must link to the localized FIDE page");
        assert.ok(fideCta.classList.contains("variant"), "the FIDE CTA must use the visible colored hover treatment intended for dark sections");

        for (const url of socialUrls) {
            assert.ok(proof.querySelector(`a[href="${url}"]`), `the proof section must visibly link to ${url}`);
        }

        assert.ok(hobbies, "the page must expose a localized hobbies section");
        const hobbyTitles = [...hobbies.querySelectorAll("h3")].map((heading) => heading.textContent?.replace(/\s+/g, " ").trim());
        assert.deepEqual(hobbyTitles, locale.hobbyTitles);

    });
}
