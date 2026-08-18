import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

const pageUrl = process.env.FIDE_TEST_URL ?? "http://127.0.0.1:3000/fr/fide";
const isFrench = new URL(pageUrl).pathname.startsWith("/fr/");
const expectedCopy = isFrench
    ? { play: "Lire la vidéo", pdfEmail: "Votre adresse e-mail", consultation: "Consultation gratuite" }
    : { play: "Play video", pdfEmail: "Your email address", consultation: "Get a free call" };
const response = await fetch(pageUrl);

assert.equal(response.status, 200, `Expected ${pageUrl} to return HTTP 200`);

const document = new JSDOM(await response.text()).window.document;

test("the FIDE hero is a labelled section with one page heading", () => {
    const hero = document.querySelector("section#HeroFide");

    assert.ok(hero, "Expected the hero to be a section landmark");
    assert.equal(document.querySelectorAll("h1").length, 1);
    assert.equal(hero.getAttribute("aria-labelledby"), "fide-page-title");
    assert.equal(hero.querySelector("h1")?.id, "fide-page-title");
});

test("the FIDE hero keeps its original compact visual composition", () => {
    const hero = document.querySelector("section#HeroFide");
    const grid = hero?.querySelector(".grid");
    const image = hero?.querySelector("img");

    assert.ok(grid?.classList.contains("gap-2"));
    assert.ok(!grid?.classList.contains("gap-10"));
    assert.ok(hero?.querySelector("p.bl")?.classList.contains("text-justify"));
    assert.ok(image?.classList.contains("!h-auto"));
    assert.ok(!image?.classList.contains("rounded-2xl"));
});

test("video previews name the play action and defer YouTube iframes", () => {
    const previews = [...document.querySelectorAll("button")].filter((button) => button.querySelector("[data-youtube-thumbnail]"));

    assert.ok(previews.length >= 4, "Expected all four FIDE video previews in the initial HTML");
    assert.ok(previews.every((button) => button.getAttribute("aria-label")?.startsWith(expectedCopy.play)), "Expected every preview to name the localized play action");
    assert.equal(document.querySelectorAll("iframe[src*='youtube']").length, 0);
});

test("the PDF email field has a persistent label", () => {
    const input = document.querySelector(".fide-page [data-fide-pdf-band] input[type='email']");

    assert.ok(input, "Expected the in-page PDF email field");
    assert.equal(input.labels?.[0]?.textContent?.trim(), expectedCopy.pdfEmail);
});

test("rendered element ids remain unique when the PDF band also appears in the footer", () => {
    const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

    assert.deepEqual([...new Set(duplicates)], []);
});

test("every editable FIDE control keeps an accessible name after its value changes", () => {
    const controls = [...document.querySelectorAll(".fide-page input:not([type='hidden']), .fide-page textarea, .fide-page button[role='combobox']")];
    const unnamedControls = controls.filter((control) => {
        const labelledBy = control.getAttribute("aria-labelledby");
        const hasReferencedLabel = labelledBy?.split(/\s+/).some((id) => document.getElementById(id)?.textContent?.trim());
        const hasExplicitLabel = "labels" in control && control.labels?.length > 0;

        return !hasExplicitLabel && !control.getAttribute("aria-label")?.trim() && !hasReferencedLabel;
    });

    assert.deepEqual(
        unnamedControls.map((control) => `${control.tagName.toLowerCase()}#${control.id || control.getAttribute("name") || control.getAttribute("role") || "unnamed"}`),
        [],
    );
});

test("form submit buttons keep a stable accessible name while their visible content changes", () => {
    const submitButtons = [...document.querySelectorAll(".fide-page form button[type='submit']")];

    assert.ok(submitButtons.length >= 2, "Expected both PDF and contact submit buttons");
    assert.ok(submitButtons.every((button) => button.getAttribute("aria-label")?.trim()), "Expected every submit button to keep a persistent aria-label");
});

test("the consultation CTA survives server rendering", () => {
    assert.ok([...document.querySelectorAll("button")].some((button) => button.textContent?.trim() === expectedCopy.consultation), "Expected the localized consultation CTA before hydration");
});

test("the contact area is exposed as a labelled section", () => {
    const section = document.querySelector("section#ContactForFIDECourses");

    assert.ok(section, "Expected the contact area to be a section landmark");
    assert.equal(section.getAttribute("aria-labelledby"), "fide-contact-title");
    assert.equal(section.querySelector("h2")?.id, "fide-contact-title");
});

test("the two in-page promotional bands use section landmarks and real headings", () => {
    const bands = [...document.querySelectorAll(".fide-page [data-fide-promo-band]")];

    assert.equal(bands.length, 2);
    assert.ok(bands.every((band) => band.tagName === "SECTION"));
    assert.ok(bands.every((band) => band.querySelector("h2")));
});

test("the tips, contact band, and detailed guides use a compact section rhythm", () => {
    const tips = document.querySelector("#fide-tips");
    const contactBand = document.querySelector("[data-fide-contact-band]");
    const contactPanel = contactBand?.querySelector(".newsletter-wrapper");
    const contactFormSlot = contactBand?.querySelector(".w-form");
    const guides = document.querySelector("[data-fide-detailed-guides]");

    assert.ok(tips?.classList.contains("!pt-16") && tips.classList.contains("!pb-10") && tips.classList.contains("lg:!pt-20") && tips.classList.contains("lg:!pb-12"));
    assert.ok(contactBand?.classList.contains("!py-0"));
    assert.ok(contactPanel?.classList.contains("max-[767px]:!min-h-[190px]"));
    assert.ok(!contactFormSlot?.classList.contains("max-[479px]:min-h-[138px]"));
    assert.ok(guides?.classList.contains("!pt-10") && guides.classList.contains("!pb-16") && guides.classList.contains("lg:!pt-12") && guides.classList.contains("lg:!pb-20"));
});

test("every direct FIDE section overrides the legacy global section padding", () => {
    const sections = [...document.querySelectorAll(".fide-page > section")];
    const sectionsWithoutOverride = sections.filter((section) => ![...section.classList].some((className) => /^(!p[tyb]-|(?:sm|md|lg|xl):!p[tyb]-)/.test(className)));

    assert.ok(sections.length >= 9, "Expected the direct FIDE page sections");
    assert.deepEqual(
        sectionsWithoutOverride.map((section) => section.id || section.getAttribute("data-fide-promo-band") || section.tagName),
        [],
    );
});

test("the detailed guide cards stay below their section heading in the heading hierarchy", () => {
    const section = document.querySelector("[data-fide-detailed-guides]");

    assert.ok(section, "Expected the detailed guides section");
    assert.equal(section.querySelectorAll("h2").length, 1);
    assert.ok(section.querySelectorAll("h3").length >= 1, "Expected guide card titles at heading level three");
});

test("rendered FIDE interactions keep motion at 150ms or less", () => {
    const slowElements = [...document.querySelectorAll(".fide-page [class]")].filter((element) => /duration-(200|300|500|700|1000)/.test(element.getAttribute("class") ?? ""));

    assert.deepEqual(
        slowElements.map((element) => `${element.tagName.toLowerCase()}.${element.getAttribute("class")}`),
        [],
    );
});

test("guide image hover motion is CSS-scoped and reduced-motion aware", () => {
    const guideImages = [...document.querySelectorAll("[data-fide-detailed-guides] img.fide-image-outline")];

    assert.ok(guideImages.length >= 1, "Expected at least one rendered guide image");
    assert.ok(guideImages.every((image) => image.parentElement?.className.trim()), "Expected no unscoped motion wrapper around guide images");
    assert.ok(guideImages.every((image) => image.classList.contains("duration-150") && image.classList.contains("motion-reduce:transform-none")));
});
