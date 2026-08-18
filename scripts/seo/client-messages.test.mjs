import assert from "node:assert/strict";
import test from "node:test";

let pickClientMessages;
try {
    ({ pickClientMessages } = await import("../../app/lib/i18n/clientMessages.mjs"));
} catch {
    pickClientMessages = undefined;
}

test("keeps client namespaces while excluding server-only dictionary content", () => {
    assert.equal(typeof pickClientMessages, "function", "pickClientMessages must be implemented");

    const messages = {
        Metadata: { Home: { title: "server only" } },
        Navigation: { home: "Home" },
        HomeFaq: { title: "server-rendered FAQ" },
        Fide: {
            CourseRatings: { successRate: "Success rate" },
            ReviewsFide: { title: "Reviews" },
            CommentThread: { noComments: "No comments" },
            FideFAQ: { title: "server-rendered FAQ" },
        },
    };

    assert.deepEqual(pickClientMessages(messages), {
        Navigation: { home: "Home" },
        Fide: {
            CourseRatings: { successRate: "Success rate" },
            ReviewsFide: { title: "Reviews" },
            CommentThread: { noComments: "No comments" },
        },
    });
});
