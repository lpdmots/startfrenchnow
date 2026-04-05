import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createExamReviewFromCalendlyBooking } from "@/app/serverActions/mockExamActions";

type PageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ event_uri?: string; test?: string; continue_url?: string; session_key?: string; compilation_id?: string }>;
};

type CalendlyScheduledEvent = {
    start_time?: string;
    end_time?: string;
    event_type?: string;
    name?: string;
};

function extractScheduledEventId(uri: string) {
    // supporte : .../scheduled_events/<id>
    const m = uri.match(/scheduled_events\/([^/?#]+)/);
    return m?.[1] ?? null;
}

async function fetchScheduledEvent(eventUriRaw?: string): Promise<CalendlyScheduledEvent | null> {
    const token = process.env.CALENDLY_ACCESS_TOKEN;
    if (!token) return null;
    if (!eventUriRaw) return null;

    const eventUri = decodeURIComponent(eventUriRaw);

    // On tente plusieurs variantes (selon ce que Calendly renvoie dans `payload.event.uri`)
    const urls = new Set<string>();
    urls.add(eventUri);

    if (eventUri.includes("calendly.com/api/v2")) {
        urls.add(eventUri.replace("https://calendly.com/api/v2", "https://api.calendly.com"));
    }

    const id = extractScheduledEventId(eventUri);
    if (id) {
        urls.add(`https://api.calendly.com/scheduled_events/${id}`);
    }

    for (const url of urls) {
        try {
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                cache: "no-store",
            });

            if (!res.ok) continue;

            const json = await res.json();
            const resource = (json?.resource ?? json) as any;

            return {
                start_time: resource?.start_time,
                end_time: resource?.end_time,
                event_type: resource?.event_type,
                name: resource?.name,
            };
        } catch {
            // on essaie la prochaine URL
        }
    }

    return null;
}

export default async function RdvSuccess(props: PageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    // supporte event_uri (ta route) + eventUri (au cas où)
    const eventUri = searchParams.event_uri;
    const continueUrl = searchParams.continue_url || "/fide";

    const scheduled = await fetchScheduledEvent(eventUri);
    const start = scheduled?.start_time;
    const sessionKey = String(searchParams.session_key || "").trim();
    const compilationId = String(searchParams.compilation_id || "").trim();

    if (params.slug === "your-exam-feedback" && sessionKey && compilationId) {
        try {
            await createExamReviewFromCalendlyBooking({
                compilationId,
                sessionKey,
                calendlyEventUri: eventUri,
                scheduledAt: start,
                timezone: "Europe/Berlin",
            });
        } catch (error) {
            console.error("[RDV Success] création examReview impossible", error);
        }
    }

    return <RdvSuccessNoAsync slug={params.slug} start={start} continueUrl={continueUrl} />;
}

const RdvSuccessNoAsync = ({ slug, start, continueUrl }: { slug: string; start?: string; continueUrl: string }) => {
    const t = useTranslations("RdvSuccess");
    const dateLabel = start
        ? new Intl.DateTimeFormat("fr-FR", {
              dateStyle: "full",
              timeStyle: "short",
              timeZone: "Europe/Berlin",
          }).format(new Date(start))
        : null;
    return (
        <main className="my-24 p-2 flex items-center justify-center">
            <div className="max-w-6xl flex flex-col card p-4 lg:p-8 justify-center items-center gap-4">
                <h1 className="text-4xl font-extrabold mb-0 heading-span-secondary-4">{t("thankYou")}</h1>
                <h2 className="text-2xl mb-0">{t("successMessage")}</h2>

                <div className="text-4xl font-bold text-secondary-2 w-full text-center">{dateLabel ? dateLabel : "-"}</div>

                <Image
                    src="/images/teacher-inversed-activated.png"
                    alt={t("successImageAlt")}
                    height={200}
                    width={200}
                    className="contain rounded-xl"
                    style={{ border: "2px solid var(--neutral-800)" }}
                />

                <div className="flex gap-2 justify-center flex-wrap">
                    <Link href={continueUrl} className="btn btn-secondary flex items-center justify-center">
                        {t("backToPage")}
                    </Link>
                </div>

                {/* optionnel: debug doux */}
                {/* <pre className="text-xs opacity-60">{JSON.stringify({ slug: params.slug, eventUri }, null, 2)}</pre> */}
            </div>
        </main>
    );
};
