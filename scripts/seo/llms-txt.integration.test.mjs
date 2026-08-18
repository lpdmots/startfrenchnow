import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

test("serves a canonical, agent-readable llms.txt without locale redirection", async () => {
    const response = await fetch(`${baseUrl}/llms.txt`, { redirect: "manual" });
    const content = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") || "", /^text\/plain\b/);
    assert.match(content, /^# Start French Now\n/m);
    assert.match(content, /^> .+/m);

    for (const url of [
        "https://startfrenchnow.ch/fr/fide",
        "https://startfrenchnow.ch/fr/fide/pack-fide",
        "https://startfrenchnow.ch/fr/fide/mock-exams",
        "https://startfrenchnow.ch/fr/fide/private-courses",
        "https://startfrenchnow.ch/fr/about",
        "https://startfrenchnow.ch/fide",
    ]) {
        assert.ok(content.includes(url), `llms.txt must link to ${url}`);
    }

    assert.doesNotMatch(content, /startfrenchnow\.com|localhost/i);
});
