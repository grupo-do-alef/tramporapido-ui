"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/api";

type Role = "WORKER" | "EMPLOYER";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(["WORKER"]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleRole(role: Role) {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) return;
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  }

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await userApi.register({
        name,
        email,
        password,
        roles: selectedRoles,
      });

      router.replace("/login");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível realizar o cadastro.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div className="w-full max-w-[460px] rounded-xl border border-[#925807] bg-[#ffeed2] p-6 text-[#925807] shadow-2xl sm:p-8 my-auto">
        <div className="mb-5 text-center">
          <h1
            id="register-modal-title"
            className="m-0 text-2xl font-semibold leading-[35px] text-[#925807]"
          >
            Criar Conta
          </h1>
          <p className="mt-1.5 mb-0 text-sm text-[#2d0f0f]">
            Junte-se à nossa plataforma
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="font-medium text-[#925807] text-sm"
            >
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="box-border h-11 w-full rounded-lg border border-[#808080] bg-white px-3.5 py-2 text-sm text-[#2d0f0f] placeholder:text-[#2d0f0f]/50 focus-visible:outline-3 focus-visible:outline-[#925807] focus-visible:outline-offset-2"
              placeholder="Seu Nome"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-medium text-[#925807] text-sm"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="box-border h-11 w-full rounded-lg border border-[#808080] bg-white px-3.5 py-2 text-sm text-[#2d0f0f] placeholder:text-[#2d0f0f]/50 focus-visible:outline-3 focus-visible:outline-[#925807] focus-visible:outline-offset-2"
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-medium text-[#925807] text-sm"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="box-border h-11 w-full rounded-lg border border-[#808080] bg-white px-3.5 py-2 text-sm text-[#2d0f0f] placeholder:text-[#2d0f0f]/50 focus-visible:outline-3 focus-visible:outline-[#925807] focus-visible:outline-offset-2"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <label className="font-medium text-[#925807] text-sm">
              O que você deseja fazer? (Pode selecionar ambos)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toggleRole("WORKER")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                  selectedRoles.includes("WORKER")
                    ? "border-[#925807] bg-[#925807] text-white shadow-sm"
                    : "border-[#808080] bg-white text-[#2d0f0f] hover:bg-neutral-50"
                }`}
              >
                <span className="text-base mb-1">🛠️</span>
                Trabalhar / Prestar serviços
              </button>

              <button
                type="button"
                onClick={() => toggleRole("EMPLOYER")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                  selectedRoles.includes("EMPLOYER")
                    ? "border-[#925807] bg-[#925807] text-white shadow-sm"
                    : "border-[#808080] bg-white text-[#2d0f0f] hover:bg-neutral-50"
                }`}
              >
                <span className="text-base mb-1">📋</span>
                Anunciar / Contratar serviços
              </button>
            </div>
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
              {loading ? "Cadastrando…" : "Concluir Cadastro"}
            </button>
          </div>
        </form>

        <p className="mt-5 mb-0 text-center text-sm text-[#2d0f0f]">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#925807] underline underline-offset-4 transition-colors hover:brightness-75"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
