"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type BugReportState = {
  error?: string;
  success?: boolean;
};

/** Beta-testing feedback channel (family-only for now — spec has no
 * "support" concept, this is purely a build-time addition). Always
 * persists the report first; the email to the maintainer is best-effort
 * on top of that, so a Resend hiccup (or the key not being configured
 * yet) never loses a report, just delays you finding out about it by
 * email. */
export async function submitBugReport(
  _prevState: BugReportState,
  formData: FormData,
): Promise<BugReportState> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const message = String(formData.get("message") ?? "").trim();
  const pageUrl = String(formData.get("pageUrl") ?? "").trim() || null;
  if (!message) return { error: "Describe what happened." };

  const reporter = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!reporter) redirect("/login");

  await prisma.bugReport.create({
    data: { reporterId: authUser.id, message, pageUrl },
  });

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.BUG_REPORT_EMAIL;
  if (apiKey && toEmail && !apiKey.includes("xxxx")) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "Noosh Jan <onboarding@resend.dev>",
        to: toEmail,
        subject: `Bug report from ${reporter.name}`,
        text: `${reporter.name} (${reporter.email}) reported:\n\n${message}${
          pageUrl ? `\n\nPage: ${pageUrl}` : ""
        }`,
      });
    } catch (err) {
      // Report is already saved — don't fail the user's submission just
      // because the notification email didn't go out.
      console.error("Failed to send bug report email:", err);
    }
  }

  return { success: true };
}
