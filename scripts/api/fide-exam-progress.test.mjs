import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../../app/serverActions/fideExamActions.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

function setup(session, user = { learningProgress: [] }) {
    const fetches = [];
    const patches = [];
    const client = {
        fetch: async (query, params) => {
            assert.equal(typeof params.userId, "string", "Sanity must always receive a userId");
            fetches.push({ query, params });
            return user;
        },
        patch: (id) => {
            const patch = { id };
            patches.push(patch);
            const builder = {
                set: (data) => { patch.set = data; return builder; },
                setIfMissing: () => builder,
                insert: (_position, _path, data) => { patch.insert = data; return builder; },
                commit: async () => ({}),
            };
            return builder;
        },
    };
    const dependencies = {
        "@/app/lib/sanity.clientServerDev": { SanityServerClient: client },
        "next-sanity": { groq: String.raw },
        uuid: { v4: () => "test-key" },
        openai: { OpenAI: class {} },
        "../lib/utils": {},
        "next-auth": { getServerSession: async () => session },
        "../lib/authOptions": { authOptions: {} },
    };
    const context = {
        exports: {},
        process: { env: {} },
        require: (name) => {
            assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
            return dependencies[name];
        },
    };
    vm.runInNewContext(outputText, context);
    return { ...context.exports, fetches, patches };
}

test("anonymous and incomplete sessions never send a progress query or mutation to Sanity", async () => {
    for (const session of [null, {}, { user: {} }, { user: { _id: "" } }, { user: { _id: "  " } }]) {
        const app = setup(session);
        assert.equal(await app.updateUserProgress("pack_fide", "examLogs", "exam-1", 2, "client-id"), null);
        assert.equal(app.fetches.length, 0);
        assert.equal(app.patches.length, 0);
    }
});

test("authenticated users can save their score without supplying a client userId", async () => {
    const app = setup({ user: { _id: "session-user" } });
    const logs = await app.updateUserProgress("pack_fide", "examLogs", "exam-1", 2);
    assert.equal(app.fetches[0].params.userId, "session-user");
    assert.equal(app.patches[0].id, "session-user");
    assert.equal(logs[0].exam._ref, "exam-1");
    assert.equal(logs[0].bestScore, 2);
});

test("a client-supplied userId cannot redirect the write to another account", async () => {
    const app = setup({ user: { _id: "session-user" } });
    await app.updateUserProgress("pack_fide", "examLogs", "exam-1", 2, "another-user");
    assert.equal(app.fetches[0].params.userId, "session-user");
    assert.equal(app.patches[0].id, "session-user");
});

test("a removed user does not trigger a patch against a missing document", async () => {
    const app = setup({ user: { _id: "removed-user" } }, null);
    assert.equal(await app.updateUserProgress("pack_fide", "examLogs", "exam-1", 2), null);
    assert.equal(app.patches.length, 0);
});

test("saving a new attempt preserves an existing better score", async () => {
    const app = setup({ user: { _id: "session-user" } }, {
        learningProgress: [{ examLogs: [{ exam: { _ref: "exam-1" }, bestScore: 3, scores: [3] }] }],
    });
    const logs = await app.updateUserProgress("pack_fide", "examLogs", "exam-1", 2);
    assert.equal(logs[0].bestScore, 3);
    assert.deepEqual(logs[0].scores, [3, 2]);
    assert.ok(app.patches[0].set['learningProgress[type == "pack_fide"].examLogs']);
});

test("reading progress without an id returns no user without querying Sanity", async () => {
    const app = setup(null);
    assert.equal(await app.getFideExamProgress(undefined, "pack_fide"), null);
    assert.equal(app.fetches.length, 0);
});
