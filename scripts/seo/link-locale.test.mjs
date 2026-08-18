import assert from "node:assert/strict";
import test from "node:test";

import { getExplicitLinkLocale } from "../../app/lib/i18n/linkLocale.mjs";

test("omits redundant locale prefixes while preserving intentional locale switches", () => {
    assert.equal(getExplicitLinkLocale("en", "en"), undefined);
    assert.equal(getExplicitLinkLocale("fr", "fr"), undefined);
    assert.equal(getExplicitLinkLocale("en", "fr"), "fr");
    assert.equal(getExplicitLinkLocale("fr", "en"), "en");
});
