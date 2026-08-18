import assert from "node:assert/strict";
import test from "node:test";

import { rewriteLegacyStartFrenchNowUrl, rewritePortableTextLegacyLinks } from "./fideLegacyLinks.mjs";

test("rewrites legacy French links to the canonical .ch locale", () => {
    assert.equal(
        rewriteLegacyStartFrenchNowUrl("https://www.startfrenchnow.com/fide#ContactForFIDECourses", "fr"),
        "https://startfrenchnow.ch/fr/fide#ContactForFIDECourses",
    );
    assert.equal(
        rewriteLegacyStartFrenchNowUrl("https://startfrenchnow.com/blog/post/fide-test-la-partie-b1-parler", "fr"),
        "https://startfrenchnow.ch/fr/blog/post/fide-test-la-partie-b1-parler",
    );
});

test("rewrites legacy English links without the erroneous French prefix", () => {
    assert.equal(
        rewriteLegacyStartFrenchNowUrl("https://www.startfrenchnow.com/fr/fide#ContactForFIDECourses", "en"),
        "https://startfrenchnow.ch/fide#ContactForFIDECourses",
    );
    assert.equal(
        rewriteLegacyStartFrenchNowUrl("https://www.startfrenchnow.com/fr/blog/post/fide-exam-jeu-de-role-simulation-a2", "en"),
        "https://startfrenchnow.ch/blog/post/fide-exam-jeu-de-role-simulation-a2",
    );
});

test("repairs the two retired FIDE article slugs in both locales", () => {
    assert.equal(
        rewriteLegacyStartFrenchNowUrl(
            "https://www.startfrenchnow.com/fr/blog/post/4-guide-pour-reussir-la-partie-lire-et-ecrire-du-test-fide",
            "fr",
        ),
        "https://startfrenchnow.ch/fr/blog/post/4-le-test-fide-lire-et-ecrire",
    );
    assert.equal(
        rewriteLegacyStartFrenchNowUrl(
            "https://www.startfrenchnow.com/blog/post/5-comment-reussir-la-partie-orale-a2-de-le-test-fide",
            "en",
        ),
        "https://startfrenchnow.ch/blog/post/5-le-test-fide-l-oral-a2-en-detail",
    );
});

test("leaves external and already canonical URLs unchanged", () => {
    assert.equal(rewriteLegacyStartFrenchNowUrl("https://fide-admin.ch/fr/attestations/test-fide", "fr"), "https://fide-admin.ch/fr/attestations/test-fide");
    assert.equal(rewriteLegacyStartFrenchNowUrl("https://startfrenchnow.ch/fr/fide", "fr"), "https://startfrenchnow.ch/fr/fide");
});

test("rewrites only Portable Text href values without mutating the input", () => {
    const portableText = [
        {
            _key: "block-1",
            _type: "block",
            children: [{ _key: "span-1", _type: "span", marks: ["link-1"], text: "Contact" }],
            markDefs: [
                {
                    _key: "link-1",
                    _type: "link",
                    href: "https://www.startfrenchnow.com/fr/fide#ContactForFIDECourses",
                    target: true,
                },
            ],
            legacyText: "https://www.startfrenchnow.com/fr/fide",
        },
    ];
    const snapshot = structuredClone(portableText);

    const result = rewritePortableTextLegacyLinks(portableText, "en");

    assert.deepEqual(portableText, snapshot);
    assert.equal(result.value[0].markDefs[0].href, "https://startfrenchnow.ch/fide#ContactForFIDECourses");
    assert.equal(result.value[0].legacyText, "https://www.startfrenchnow.com/fr/fide");
    assert.deepEqual(result.changes, [
        {
            path: "0.markDefs.0.href",
            from: "https://www.startfrenchnow.com/fr/fide#ContactForFIDECourses",
            to: "https://startfrenchnow.ch/fide#ContactForFIDECourses",
        },
    ]);
});
