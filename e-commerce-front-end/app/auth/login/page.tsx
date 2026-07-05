"use client"

import {useState} from "react";
import {useRouter} from "next/navigation"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type LoginResponse = {
    access_token: string;
    token_type: string;
};

function getApiErrorMessage(payload: unknown, fallback: string): string {
    if (
        typeof payload === "object" &&
        payload !== null &&
        "detail" in payload &&
        typeof (payload as { detail?: unknown }).detail === "string"
    ) {
        return (payload as { detail: string }).detail;
    }

    return fallback;
}

export default function LoginPage() {

    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {

        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const payload = (await response.json().catch(() => null)) as unknown;

            if (!response.ok) {
                setErrorMessage(
                    getApiErrorMessage(payload, "Login failed. Please try again."),
                );
                return;
            }

            const data = payload as LoginResponse;
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("token_type", data.token_type);
            localStorage.setItem("user_email", email);

            setSuccessMessage("Login successful. Redirecting to homepage...");
            setPassword("");
            router.push("/");
            router.refresh();
        } catch {
            setErrorMessage(
                "Cannot reach API server. Is backend running on port 8000?",
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#fff_45%,_#f8fafc_100%)] px-4 py-12">
            <section className="mx-auto w-full max-w-md rounded-3xl border border-black/10 bg-white/90 p-8 shadow-[0_15px_60px_-25px_rgba(15,23,42,0.35)] backdrop-blur">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                    Welcome Back
                </p>
                <h1 className="text-3xl font-bold text-slate-900">Login</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Use your API account credentials.
                </p>

                <form onSubmit={onSubmit} className="mt-8 space-y-5">
                    <label
                        className="block text-sm font-medium text-slate-700"
                        htmlFor="email"
                    >
                        Email
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 transition focus:border-blue-500"
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label
                        className="block text-sm font-medium text-slate-700"
                        htmlFor="password"
                    >
                        Password
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 transition focus:border-blue-500"
                            autoComplete="current-password"
                            minLength={6}
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        {isLoading ? "Signing in..." : "Login"}
                    </button>
                </form>

                {errorMessage ? (
                    <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {errorMessage}
                    </p>
                ) : null}

                {successMessage ? (
                    <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {successMessage}
                    </p>
                ) : null}

                <p className="mt-8 text-sm text-slate-600">
                    Need an account?
                    <Link
                        href="/auth/register"
                        className="ml-2 font-semibold text-slate-900 underline"
                    >
                        Register here
                    </Link>
                </p>
            </section>
        </main>
    );

}