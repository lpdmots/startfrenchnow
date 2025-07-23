export interface Event {
    id: string;
    formattedDate: string;
    startTime: string;
    endTime: string;
    date: string;
    zoomUrl: string;
    duration: number;
    status: "canceled" | "completed" | "upcoming" | "current";
}

export interface CalendlyEvent {
    start_time: Date;
    end_time: Date;
    location: { join_url: string };
    status: "active" | "canceled";
}

export interface CalendlyData {
    calendlyEvents: CalendlyEvent[];
    email: string;
    eventType: string;
    totalPurchasedMinutes: number;
    _key: string;
}

export interface PrivateLesson {
    events: Event[];
    completedMinutes: number;
    upcomingMinutes: number;
    remainingMinutes: number;
    currentMinutes: number;
    email: string;
    eventType: string;
    totalPurchasedMinutes: number;
    _key: string;
}
