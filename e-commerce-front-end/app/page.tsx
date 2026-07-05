"use client";

import Link from "next/link";
import { useState } from "react";


export default function Home() {

  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return localStorage.getItem("user_email") ?? "";
  });

  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return localStorage.getItem("access_token") ?? "";
  });


  const [tokenType, setTokenType] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return localStorage.getItem("token_type") ?? "";
  });

  function handleLogout() {
    localStorage.removeItem("user_email");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user_role");
    setEmail("");
    setToken("");
    setTokenType("");
  }

  return (
  <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#e2e8f0_0%,#f8fafc_55%,#fef3c7_100%)] px-4 py-16">
      <section className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white/90 p-8 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.5)] backdrop-blur sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          E-Commerce Frontend
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
          Authentication Ready
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Use Register and Login pages connected to your FastAPI auth endpoints.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/auth/register"
            className="rounded-2xl bg-slate-900 px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Open Register Page
          </Link>
          <Link
            href="/auth/login"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-800 transition hover:border-slate-800"
          >
            Open Login Page
          </Link>
          <Link
            href="/products"
            className="rounded-2xl bg-cyan-700 px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Open Products Page
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">Session Status</p>
          {token ? (
            <>
              <p className="mt-2 text-sm text-slate-700">
                Logged in as: {email || "Unknown user"}
              </p>
              <p className="mt-1 break-all text-xs text-slate-500">
                Token: {token.slice(0, 24)}...
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                Type: {tokenType || "bearer"}
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
              >
                Logout
              </button>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No token stored yet. Please login first.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}