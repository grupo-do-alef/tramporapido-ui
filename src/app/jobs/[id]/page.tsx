"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { taskApi, userApi } from "@/lib/api";

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

interface TaskData {
  id: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  status: string;
  modality: string;
  income?: number;
}

export default function VagaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<TaskData | null>(null);
  const [error, setError] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const [activeView, setActiveView] = useState<
    "resumo" | "candidaturas" | "duvidas"
  >("resumo");
  const [novaPergunta, setNovaPergunta] = useState("");
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);

  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);

  useEffect(() => {
    const hasToken = document.cookie.includes("token=");

    if (!hasToken) {
      router.replace("/login");
      return;
    }

    setIsAuthorized(true);

    taskApi.myApplications().then((items) => setIsApplied(items.some((item) => item.taskId === id))).catch(() => undefined);

    async function fetchTaskDetails() {
      try {
        setLoading(true);
        const data = await taskApi.getById(id);
        setTask(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os detalhes da vaga.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTaskDetails();
    }
  }, [id, router]);

  if (!isAuthorized || loading) {
    return (
      <div className="flex w-full items-center justify-center p-8">
        <p className="text-sm text-muted">
          {!isAuthorized
            ? "Verificando sessão..."
            : "Carregando detalhes da vaga..."}
        </p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p className="text-sm text-[#b42318] mb-4">
          {error || "Vaga não encontrada."}
        </p>
        <Link
          href="/jobs"
          className="text-sm font-medium text-[#925807] underline"
        >
          Voltar para lista de vagas
        </Link>
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

  async function applyToTask() {
    setApplying(true);
    setApplicationMessage("");
    try {
      const profile = await userApi.getProfile();
      if (!profile.education?.length || !profile.skills?.length || !profile.experiences?.length) {
        router.push(`/resume?returnTo=${encodeURIComponent(`/jobs/${id}`)}`);
        return;
      }
      if (!window.confirm("Confirmar candidatura para esta vaga?")) return;
      await taskApi.apply(id);
      setIsApplied(true);
      setApplicationMessage("Candidatura enviada com sucesso!");
    } catch (cause) {
      setApplicationMessage(cause instanceof Error ? cause.message : "Não foi possível enviar a candidatura.");
    } finally { setApplying(false); }
  }

  function handleAlterarStatus(appId: string, novoStatus: string) {
    setCandidaturas(
      candidaturas.map((c) =>
        c.id === appId ? { ...c, status: novoStatus } : c,
      ),
    );
  }

  const modalityMap: Record<string, string> = {
    IN_PERSON: "Presencial",
    HYBRID: "Híbrido",
    HOME_OFFICE: "Remoto",
  };

  return (
    <div className="mx-auto max-w-6xl p-6 text-ink text-sm leading-5">
      <h1 className="text-2xl font-semibold text-ink m-0 leading-[35px]">
        Gerenciamento da vaga
      </h1>
      <p className="text-xs text-muted mb-6 mt-1">
        Informações detalhadas da oportunidade
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <section className="md:col-span-3 bg-white border border-[#808080] rounded-lg p-6 shadow-sm">
          {activeView === "resumo" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-ink">{task.title}</h2>
              <p className="text-xs text-muted">
                Status: {task.status} •{" "}
                {modalityMap[task.modality] || task.modality}
              </p>
              <p className="font-medium text-ink">
                Salário: R${" "}
                {task.income?.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                / mês
              </p>
              <p className="text-muted">
                {task.neighborhood ? `${task.neighborhood} • ` : ""}
                {task.city}
              </p>
              <h3 className="text-lg font-semibold text-ink pt-2">
                Descrição e requisitos
              </h3>
              <p className="text-ink leading-relaxed whitespace-pre-line">
                {task.description}
              </p>
              <button type="button" disabled={applying || isApplied} onClick={applyToTask}
                className="rounded-lg bg-[#925807] px-4 py-2 text-white disabled:opacity-50">
                {isApplied ? "Inscrito" : applying ? "Enviando…" : "Candidatar-se"}
              </button>
              {applicationMessage && <p role="status">{applicationMessage}</p>}
            </div>
          )}

          {activeView === "candidaturas" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-ink">
                Candidaturas recebidas
              </h2>
              <p className="text-xs text-muted">
                Total: {candidaturas.length} inscrito(s)
              </p>
              <div className="grid gap-3 w-full">
                {candidaturas.map((c) => (
                  <div
                    key={c.id}
                    className="border border-[#808080] p-4 rounded-lg bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm text-ink">
                        <strong>Candidato:</strong>{" "}
                        {c.candidateId.substring(0, 8)}...
                      </p>
                      <p className="text-sm text-ink mt-1">
                        <strong>Status:</strong>{" "}
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                          {c.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-[#925807] hover:brightness-95 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleAlterarStatus(c.id, "APPROVED")}
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-ink bg-white border border-[#808080] hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
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
              <h2 className="text-xl font-semibold text-ink">
                Dúvidas e comentários
              </h2>
              <form
                onSubmit={handleEnviarPergunta}
                className="grid gap-3 w-full"
              >
                <label
                  htmlFor="duvida"
                  className="text-sm font-medium text-ink"
                >
                  Enviar pergunta ao contratante:
                </label>
                <input
                  id="duvida"
                  type="text"
                  placeholder="Escreva sua dúvida aqui..."
                  value={novaPergunta}
                  onChange={(e) => setNovaPergunta(e.target.value)}
                  className="w-full h-[42px] px-3 py-2 border border-[#808080] rounded-lg focus-visible:outline-3 focus-visible:outline-ink focus-visible:outline-offset-3 text-sm"
                />
                <button
                  type="submit"
                  className="w-40 h-[42px] px-4 py-2 text-sm font-medium text-white bg-[#925807] hover:brightness-95 rounded-lg transition-colors cursor-pointer"
                >
                  Enviar dúvida
                </button>
              </form>

              <h3 className="text-lg font-semibold text-ink pt-4">
                Perguntas registradas
              </h3>
              <div className="grid gap-3 w-full">
                {duvidas.map((d) => (
                  <div
                    key={d.id}
                    className="border border-[#808080] p-4 rounded-lg bg-white"
                  >
                    <p className="text-sm text-ink">
                      <strong>P:</strong> {d.pergunta}
                    </p>
                    {d.resposta ? (
                      <p className="text-sm text-muted mt-2">
                        <strong>R:</strong> {d.resposta}
                      </p>
                    ) : (
                      <p className="text-sm text-muted italic mt-2">
                        Aguardando resposta do contratante.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <nav className="flex flex-col gap-2" aria-label="Ações da oportunidade">
          <button
            type="button"
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
              activeView === "resumo"
                ? "border-[#925807] bg-[#925807] text-white"
                : "border-[#808080] bg-white text-ink hover:bg-neutral-50"
            }`}
            onClick={() => setActiveView("resumo")}
          >
            Resumo da vaga
          </button>
          <button
            type="button"
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
              activeView === "candidaturas"
                ? "border-[#925807] bg-[#925807] text-white"
                : "border-[#808080] bg-white text-ink hover:bg-neutral-50"
            }`}
            onClick={() => setActiveView("candidaturas")}
          >
            Acompanhar candidaturas
          </button>
          <button
            type="button"
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
              activeView === "duvidas"
                ? "border-[#925807] bg-[#925807] text-white"
                : "border-[#808080] bg-white text-ink hover:bg-neutral-50"
            }`}
            onClick={() => setActiveView("duvidas")}
          >
            Dúvidas / comentários
          </button>
          <Link
            href="/jobs"
            className="text-center text-sm font-medium text-ink py-3 px-4 border border-[#808080] rounded-lg hover:bg-neutral-50 transition-colors no-underline mt-2"
          >
            Voltar para lista
          </Link>
        </nav>
      </div>
    </div>
  );
}
