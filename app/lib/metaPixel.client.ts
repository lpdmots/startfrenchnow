// Le pixel Meta est chargé par tarteaucitron (service "facebookpixel") seulement après consentement :
// tant que window.fbq n'existe pas, aucun événement n'est envoyé.

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

const READY_TIMEOUT_MS = 15000;
const READY_POLL_MS = 250;

type MetaEventParams = Record<string, unknown>;

function sendMetaEvent(eventName: string, params?: MetaEventParams, eventId?: string): void {
    try {
        if (eventId) {
            window.fbq?.("track", eventName, params || {}, { eventID: eventId });
            return;
        }
        window.fbq?.("track", eventName, params || {});
    } catch {
        // Le tracking ne doit jamais gêner la navigation ou un paiement.
    }
}

/** PageView lors des navigations côté client (le premier PageView est envoyé par tarteaucitron). */
export function trackMetaPageView(): void {
    if (typeof window === "undefined" || !window.fbq) return;
    sendMetaEvent("PageView");
}

/**
 * Envoie un événement dès que le pixel est prêt (il peut se charger après le rendu de la page).
 * `eventId` doit être identique à celui envoyé par l'API Conversions pour que Meta déduplique.
 */
export function trackMetaEvent(eventName: string, params?: MetaEventParams, eventId?: string): void {
    if (typeof window === "undefined") return;

    if (window.fbq) {
        sendMetaEvent(eventName, params, eventId);
        return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
        if (window.fbq) {
            window.clearInterval(timer);
            sendMetaEvent(eventName, params, eventId);
            return;
        }
        if (Date.now() - startedAt > READY_TIMEOUT_MS) {
            window.clearInterval(timer);
        }
    }, READY_POLL_MS);
}
