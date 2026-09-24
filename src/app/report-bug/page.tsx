import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/current-user";
import { BugReportForm } from "@/components/bug-report-form";

export default async function ReportBugPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Best-effort prefill of "which page" from the referring page — editable,
    // not required to be accurate.
    const referer = (await headers()).get("referer") ?? undefined;

    return (
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-8">
            <h1 className="font-display text-3xl text-sage-900">Something broken?</h1>
            <p className="mt-2 text-sm text-ink/70">
                For family and friends (my beta testers). If something breaks, looks wrong, or just
                feels off, tell me and I&apos;ll fix it.
            </p>
            <BugReportForm defaultPageUrl={referer} />
        </main>
    );
}
