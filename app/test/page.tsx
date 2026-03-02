import SpeechToSpeechTester from "./SpeechToSpeechTester";
import { EXAMINER_PROMPT } from "./prompt";

export default function TestSpeechPage() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-10 text-neutral-800">
            <section className="rounded-2xl border border-neutral-300 bg-neutral-50 p-6 sm:p-8">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Test Speech-to-Speech OpenAI</h1>
                <p className="mt-3 text-sm text-neutral-800 sm:text-base">
                    Prototype minimal pour parler avec l&apos;IA. Cliquez sur <span className="font-semibold">Commencer</span>, parlez, puis <span className="font-semibold">Terminer</span>.
                </p>
            </section>

            <section className="rounded-2xl border border-neutral-300 bg-white p-6 sm:p-8">
                <h2 className="text-base font-semibold text-neutral-800 sm:text-lg">Prompt envoye a OpenAI</h2>
                <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-800">{EXAMINER_PROMPT}</pre>
            </section>

            <SpeechToSpeechTester />
        </main>
    );
}
