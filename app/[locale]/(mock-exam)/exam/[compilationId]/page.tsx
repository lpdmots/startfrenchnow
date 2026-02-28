import { redirect } from "next/navigation";

export default function LegacyMockExamRunnerRedirect({
    params: { locale, compilationId },
}: {
    params: { locale: string; compilationId: string };
}) {
    redirect(`/${locale}/mock-exams/${compilationId}/runner`);
}

