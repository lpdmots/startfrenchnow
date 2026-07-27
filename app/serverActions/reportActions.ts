"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/authOptions";
import { createReportDateRange } from "@/app/lib/reporting/dateRange";
import { generateSalesReport } from "@/app/lib/reporting/salesReport";
import { sendSalesReportEmail } from "@/app/lib/reporting/reportEmail";

export async function sendAdminSalesReportEmail(formData: FormData): Promise<void> {
    const session = await getServerSession(authOptions);
    if (session?.user?.isAdmin !== true) {
        redirect("/");
    }

    const from = String(formData.get("from") || "");
    const to = String(formData.get("to") || "");
    const locale = formData.get("locale") === "en" ? "en" : "fr";
    const range = createReportDateRange(from, to);
    let emailStatus = "sent";

    try {
        const report = await generateSalesReport(range);
        await sendSalesReportEmail(report);
    } catch (error) {
        console.error("[AdminSalesReport] manual email failed", error);
        emailStatus = "error";
    }

    redirect(`/${locale}/admin/reports?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}&emailStatus=${emailStatus}`);
}
