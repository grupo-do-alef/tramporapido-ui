"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Duvida {
  id: string;
  pergunta: string;
  resposta?: string;
}

interface Candidatura {
  id: string;
  candidateId: string;
  status: string;
}

export default function VagaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeView, setActiveView] = useState<
    "resumo" | "candidaturas" | "duvidas"
  >("resumo");
  const [novaPergunta, setNovaPergunta] = useState("");
  const [duvidas, setDuvidas] = useState<Duvida[]>([
    {
      id: "1",
      pergunta: "Qual a carga horária semanal presencial no modelo híbrido?",
      resposta: "Serão 3 dias no escritório (Centro) e 2 dias em home office.",
    },
  ]);

  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([
    {
      id: "946160bf-f5a3-47ea-b2d8-8ff78b662ff1",
      candidateId: "11111111-1111-1111-1111-111111111111",
      status: "PENDING",
    },
  ]);

  useEffect(() => {
    const hasToken = document.cookie.includes("token=");

    if (!hasToken) {
      router.replace("/login");
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex w-full items-center justify-center p-8">
        <p className="text-sm text-neutral-500">Verificando sessão...</p>
      </div>
    );
  }

  function handleEnviarPergunta(e: React.FormEvent) {
    e.preventDefault();
    if (!novaPergunta.trim()) return;
    setDuvidas([
      ...duvidas,
      { id: String(Date.now()), pergunta: novaPergunta.trim() },
    ]);
    setNovaPergunta("");
  }

  function handleAlterarStatus(appId: string, novoStatus: string) {
    setCandidaturas(
      candidaturas.map((c) =>
        c.id === appId ? { ...c, status: novoStatus } : c,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-bold text-neutral-900">
        Gerenciamento da vaga
      </h1>
      <p className="text-sm text-neutral-500 mb-6">
        Nº {id.substring(0, 8)} • Informações detalhadas da oportunidade
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Coluna Principal de Conteúdo */}
        <section className="md:col-span-3 bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          {activeView === "resumo" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-neutral-800">
                Auxiliar administrativo
              </h2>
              <p className="text-sm text-neutral-500">
                Nº 1024 • CLT • Período integral • Presencial
              </p>
              <p className="font-medium text-neutral-700">
                Salário: R$ 1.900,00 / mês
              </p>
              <p className="text-neutral-600">Centro • São Paulo / SP</p>
              <h3 className="text-lg font-semibold text-neutral-800 pt-2">
                Descrição e requisitos
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Organize documentos, atenda clientes e apoie rotinas
                administrativas. Ensino médio completo e organização.
              </p>
            </div>
          )}

          {activeView === "candidaturas" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-neutral-800">
                Candidaturas recebidas
              </h2>
              <p className="text-sm text-neutral-500">
                Total: {candidaturas.length} inscrito(s)
              </p>
              <div className="grid gap-3 w-full">
                {candidaturas.map((c) => (
                  <div
                    key={c.id}
                    className="border border-neutral-200 p-4 rounded-lg bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm text-neutral-700">
                        <strong>Candidato:</strong>{" "}
                        {c.candidateId.substring(0, 8)}...
                      </p>
                      <p className="text-sm text-neutral-700 mt-1">
                        <strong>Status:</strong>{" "}
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                          {c.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleAlterarStatus(c.id, "APPROVED")}
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleAlterarStatus(c.id, "REJECTED")}
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === "duvidas" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-neutral-800">
                Dúvidas e comentários
              </h2>
              <form
                onSubmit={handleEnviarPergunta}
                className="grid gap-3 w-full"
              >
                <label
                  htmlFor="duvida"
                  className="text-sm font-medium text-neutral-700"
                >
                  Enviar pergunta ao contratante:
                </label>
                <input
                  id="duvida"
                  type="text"
                  placeholder="Escreva sua dúvida aqui..."
                  value={novaPergunta}
                  onChange={(e) => setNovaPergunta(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  className="w-40 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Enviar dúvida
                </button>
              </form>

              <h3 className="text-lg font-semibold text-neutral-800 pt-4">
                Perguntas registradas
              </h3>
              <div className="grid gap-3 w-full">
                {duvidas.map((d) => (
                  <div
                    key={d.id}
                    className="border border-neutral-200 p-4 rounded-lg bg-neutral-50/50"
                  >
                    <p className="text-sm text-neutral-800">
                      <strong>P:</strong> {d.pergunta}
                    </p>
                    {d.resposta ? (
                      <p className="text-sm text-neutral-600 mt-2">
                        <strong>R:</strong> {d.resposta}
                      </p>
                    ) : (
                      <p className="text-sm text-neutral-400 italic mt-2">
                        Aguardando resposta do contratante.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Coluna Lateral: Navegação */}
        <nav className="flex flex-col gap-2" aria-label="Ações da oportunidade">
          <button
            type="button"
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeView === "resumo"
                ? "bg-blue-600 text-white"
                : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
            }`}
            onClick={() => setActiveView("resumo")}
          >
            Resumo da vaga
          </button>
          <button
            type="button"
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeView === "candidaturas"
                ? "bg-blue-600 text-white"
                : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
            }`}
            onClick={() => setActiveView("candidaturas")}
          >
            Acompanhar candidaturas
          </button>
          <button
            type="button"
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeView === "duvidas"
                ? "bg-blue-600 text-white"
                : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
            }`}
            onClick={() => setActiveView("duvidas")}
          >
            Dúvidas / comentários
          </button>
          <Link
            href="/jobs"
            className="text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 py-3 px-4 border border-transparent rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Voltar para lista
          </Link>
        </nav>
      </div>
    </div>
  );
}
