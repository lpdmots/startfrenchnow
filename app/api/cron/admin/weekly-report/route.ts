import { NextRequest, NextResponse } from "next/server";
import { previousCompletedWeekRange } from "@/app/lib/reporting/dateRange";
import { generateSalesReport } from "@/app/lib/reporting/salesReport";
import { sendSalesReportEmail } from "@/app/lib/reporting/reportEmail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorizedCronRequest(request: NextRequest): boolean {
    const expectedSecret = String(process.env.CRON_SECRET || "").trim();
    const authHeader = String(request.headers.get("authorization") || "").trim();

    if (process.env.NODE_ENV !== "production" && !expectedSecret) {
        return true;
    }
    if (!expectedSecret) {
        return false;
    }
    return authHeader === `Bearer ${expectedSecret}`;
}

export async function GET(request: NextRequest) {
    if (!isAuthorizedCronRequest(request)) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const range = previousCompletedWeekRange();
        const report = await generateSalesReport(range);
        await sendSalesReportEmail(report);

        return NextResponse.json({
            ok: true,
            range: { from: range.from, to: range.to },
            purchases: report.summary.purchaseCount,
            calendlyLeads: report.calendly.leads.length,
        });
    } catch (error) {
        console.error("[WeeklySalesReport] failed", error);
        return NextResponse.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : "Weekly report failed",
            },
            { status: 500 },
        );
    }
}
