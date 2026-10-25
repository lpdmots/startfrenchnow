import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../../", import.meta.url));

export function loadTs(entry, mocks = {}, globals = {}) {
    const cache = new Map();
    function load(filename) {
        if (cache.has(filename)) return cache.get(filename);
        const exports = {};
        cache.set(filename, exports);
        const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
        });
        vm.runInNewContext(outputText, {
            process: { env: {} }, console, Response, Request, AbortSignal, setTimeout,
            ...globals,
            exports,
            require: (name) => {
                if (name in mocks) return mocks[name];
                if (name.startsWith(".") || name.startsWith("@/")) {
                    const base = name.startsWith("@/") ? path.join(root, name.slice(2)) : path.resolve(path.dirname(filename), name);
                    const target = [base, `${base}.ts`, `${base}.tsx`].find((p) => existsSync(p));
                    if (!target) throw new Error(`Missing test dependency: ${name}`);
                    return load(target);
                }
                return require(name);
            },
        }, { filename });
        return exports;
    }
    return load(path.resolve(root, entry));
}
