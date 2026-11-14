"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { updatePassword, type AuthActionState } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

const initialState: AuthActionState = {};

export default function ResetPasswordPage() {
    const [state, formAction, pending] = useActionState(updatePassword, initialState);
    const [linkStatus, setLinkStatus] = useState<"checking" | "ready" | "expired">(
        "checking",
    );
    const [linkError, setLinkError] = useState<string | null>(null);

    useEffect(() => {
        async function consumeLink() {
            const params = new URLSearchParams(window.location.hash.slice(1));
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            let reason: string | null = null;
            if (params.has("error_description")) {
                reason = params.get("error_description");
            } else if (accessToken && refreshToken) {
                const { error } = await createClient().auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });
                if (error) reason = error.message;
            }
            if (window.location.hash) {
                window.history.replaceState(null, "", window.location.pathname);
            }
            setLinkError(reason);
            setLinkStatus(reason ? "expired" : "ready");
        }
        consumeLink();
    }, []);

    if (linkStatus === "expired") {
        return (
            <main className="flex flex-1 items-center justify-center px-4 py-16">
                <div className="w-full max-w-sm">
                    <h1 className="font-display text-3xl text-sage-900">Link expired</h1>
                    <p className="mt-2 text-sm text-ink/70">
                        That reset link is invalid or has already been used.
                    </p>
                    {linkError && (
                        <p className="mt-2 text-xs text-ink/50">Details: {linkError}</p>
                    )}
                    <Link
                        href="/forgot-password"
                        className="mt-6 inline-block rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-900"
                    >
                        Send a new link
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center px-4 py-16">
            <div className="w-full max-w-sm">
                <h1 className="font-display text-3xl text-sage-900">Choose a new password</h1>
                <p className="mt-2 text-sm text-ink/70">
                    You&apos;ll stay logged in once it&apos;s saved.
                </p>

                <form action={formAction} className="mt-8 flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-ink/80">New password</span>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            autoComplete="new-password"
                            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-ink/80">Confirm new password</span>
                        <input
                            type="password"
                            name="confirm"
                            required
                            minLength={6}
                            autoComplete="new-password"
                            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
                        />
                    </label>

                    {state.error && (
                        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                            {state.error}{" "}
                            {state.error.includes("expired") && (
                                <Link href="/forgot-password" className="font-medium underline">
                                    Send a new link
                                </Link>
                            )}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={pending || linkStatus === "checking"}
                        className="mt-2 rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
                    >
                        {pending ? "Saving…" : "Save password"}
                    </button>
                </form>
            </div>
        </main>
    );
}
