"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthActionState } from "@/lib/actions/auth";

const initialState: AuthActionState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-sage-900">Noosh jan</h1>
        <p className="mt-2 text-sm text-ink/70">
          Create an account to start logging what you cook.
        </p>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink/80">What should we call you?</span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink/80">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink/80">Password</span>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
            />
          </label>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {state.error}
            </p>
          )}
          {state.info && (
            <p className="rounded-lg bg-sage-50 px-3.5 py-2.5 text-sm text-sage-900">
              {state.info}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/70">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-sage-600 hover:text-sage-900">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
