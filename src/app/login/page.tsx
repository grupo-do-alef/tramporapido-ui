"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await userApi.login(email, password);

      router.replace("/");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Não foi possível entrar.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-[460px] rounded-xl border border-[#925807] bg-[#ffeed2] p-6 text-[#925807] shadow-2xl sm:p-10">
        <div className="mb-6 text-center">
          <h1
            id="login-modal-title"
            className="m-0 text-2xl font-semibold leading-[35px] text-[#925807]"
          >
            Entrar
          </h1>
          <p className="mt-1.5 mb-0 text-sm text-[#2d0f0f]">
            Acesse sua conta para continuar
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-medium text-[#925807]">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="box-border h-11 w-full rounded-lg border border-[#808080] bg-white px-3.5 py-2 text-sm text-[#2d0f0f] placeholder:text-[#2d0f0f]/50 focus-visible:outline-3 focus-visible:outline-[#925807] focus-visible:outline-offset-2"
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-medium text-[#925807]">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="box-border h-11 w-full rounded-lg border border-[#808080] bg-white px-3.5 py-2 text-sm text-[#2d0f0f] placeholder:text-[#2d0f0f]/50 focus-visible:outline-3 focus-visible:outline-[#925807] focus-visible:outline-offset-2"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="m-0 rounded-md border border-rose-300 bg-rose-50 p-2.5 text-xs font-medium text-rose-800"
            >
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-[#925807] bg-[#925807] px-4 py-2.5 text-base font-semibold text-white transition-all hover:brightness-94 focus-visible:outline-3 focus-visible:outline-[#925807] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </div>
        </form>

        <p className="mt-6 mb-0 text-center text-sm text-[#2d0f0f]">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#925807] underline underline-offset-4 transition-colors hover:brightness-75"
          >
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
