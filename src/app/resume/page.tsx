"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { userApi } from "@/lib/api";

type Education = {
  course: string;
  level: string;
  institution: string;
  start: string;
  end: string;
  ongoing: boolean;
};

type Experience = {
  role: string;
  company: string;
  current: boolean;
  start: string;
  end: string;
  modality: string;
  description: string;
};

type ResumeFormValues = {
  education: Education[];
  skills: string[];
  experiences: Experience[];
};

const emptyEducation: Education = {
  course: "",
  level: "",
  institution: "",
  start: "",
  end: "",
  ongoing: false,
};

const emptyExperience: Experience = {
  role: "",
  company: "",
  current: false,
  start: "",
  end: "",
  modality: "",
  description: "",
};

const defaultResume: ResumeFormValues = {
  education: [emptyEducation],
  skills: [],
  experiences: [emptyExperience],
};

export default function ResumePage() {
  return (
    <Suspense fallback={<p role="status">Carregando currículo…</p>}>
      <ResumeForm />
    </Suspense>
  );
}

function ResumeForm() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [step, setStep] = useState<"education" | "experience" | "saved">(
    "education",
  );
  const [skillInput, setSkillInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [skillsError, setSkillsError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ResumeFormValues>({
    defaultValues: defaultResume,
    mode: "onSubmit",
  });

  const { fields: educationFields, append: appendEducation } = useFieldArray({
    control,
    name: "education",
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: "experiences",
  });

  const skills = watch("skills") || [];

  useEffect(() => {
    const hasToken = document.cookie.includes("token=");

    if (!hasToken) {
      router.replace("/login");
      return;
    }

    setIsAuthorized(true);
    userApi.getProfile().then((profile) => {
      if (profile.education?.length || profile.skills?.length || profile.experiences?.length) {
        reset(profile as ResumeFormValues);
        if (profile.education?.length) setStep("education");
      }
    }).catch(() => undefined).finally(() => setIsLoaded(true));
  }, [router]);

  if (!isAuthorized || !isLoaded) {
    return (
      <div className="flex w-full items-center justify-center p-12">
        <p className="text-sm text-neutral-500">Verificando sessão...</p>
      </div>
    );
  }

  function handleAddSkill() {
    const trimmed = skillInput.trim();
    if (
      trimmed &&
      !skills.some(
        (s) =>
          s.toLocaleLowerCase("pt-BR") === trimmed.toLocaleLowerCase("pt-BR"),
      )
    ) {
      const updated = [...skills, trimmed];
      setValue("skills", updated);
      setSkillsError("");
    }
    setSkillInput("");
  }

  function handleRemoveSkill(indexToRemove: number) {
    const updated = skills.filter((_, idx) => idx !== indexToRemove);
    setValue("skills", updated);
  }

  async function handleNextStep() {
    const hasSkill = skills.some((skill) => skill.trim()) || Boolean(skillInput.trim());
    setSkillsError(hasSkill ? "" : "Informe pelo menos uma habilidade.");
    if (await trigger("education") && hasSkill) {
      handleAddSkill();
      setStep("experience");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const onSubmitFinal = async (data: ResumeFormValues) => {
    try {
      setSaveError("");
      await userApi.saveProfile(data);
      window.dispatchEvent(new Event("curriculo-atualizado"));
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      if (returnTo) { router.push(returnTo); return; }
      setStep("saved");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Não foi possível salvar o perfil.");
      setStep("experience");
    }
  };

  return (
    <div>
      <div>
        <h1 className="m-0 text-2xl font-semibold text-ink">Meu currículo</h1>
        <p className="mt-1 mb-0 text-xs text-muted">
          1. Escolaridade e habilidades → 2. Experiências
        </p>
      </div>

      {step === "education" && (
        <div className="flex flex-col gap-5 mt-4">
          <section className="flex flex-col gap-4 rounded-lg border border-default bg-white p-5">
            <h2 className="m-0 text-lg font-semibold text-ink">Escolaridade</h2>

            {educationFields.map((field, index) => {
              const isOngoing = watch(`education.${index}.ongoing`);
              const fieldErrors = errors.education?.[index];

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-4 border-b border-cream pb-4 last:border-none last:pb-0 sm:grid-cols-2"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase text-neutral-600">
                      Título do curso *
                    </label>
                    <input
                      {...register(`education.${index}.course`, {
                        required: "Informe o curso",
                      })}
                      className={`h-10 rounded-lg border px-3 text-sm text-muted bg-white ${fieldErrors?.course ? "border-rose-600" : "border-default"}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase text-neutral-600">
                      Nível *
                    </label>
                    <input
                      {...register(`education.${index}.level`, {
                        required: "Informe o nível",
                      })}
                      className={`h-10 rounded-lg border px-3 text-sm text-muted bg-white ${fieldErrors?.level ? "border-rose-600" : "border-default"}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase text-neutral-600">
                      Instituição *
                    </label>
                    <input
                      {...register(`education.${index}.institution`, {
                        required: "Informe a instituição",
                      })}
                      className={`h-10 rounded-lg border px-3 text-sm text-muted bg-white ${fieldErrors?.institution ? "border-rose-600" : "border-default"}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase text-neutral-600">
                        Início *
                      </label>
                      <input
                        placeholder="MM/AAAA"
                        {...register(`education.${index}.start`, {
                          validate: (value) => Boolean(value?.trim()) || "Informe o início do curso.",
                        })}
                        aria-invalid={Boolean(fieldErrors?.start)}
                        className="h-10 rounded-lg border border-default px-3 text-sm text-muted bg-white"
                      />
                      {fieldErrors?.start && <p role="alert" className="text-xs text-rose-700">{fieldErrors.start.message}</p>}
                    </div>
                    {!isOngoing && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase text-neutral-600">
                          Conclusão *
                        </label>
                        <input
                          placeholder="MM/AAAA"
                          {...register(`education.${index}.end`, {
                            validate: (value, form) =>
                              form.education[index].ongoing || Boolean(value?.trim()) || "Informe a conclusão do curso.",
                          })}
                          aria-invalid={Boolean(fieldErrors?.end)}
                          className="h-10 rounded-lg border border-default px-3 text-sm text-muted bg-white"
                        />
                        {fieldErrors?.end && <p role="alert" className="text-xs text-rose-700">{fieldErrors.end.message}</p>}
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-sm font-medium text-muted cursor-pointer sm:col-span-2">
                    <input
                      type="checkbox"
                      {...register(`education.${index}.ongoing`)}
                      className="size-4 accent-ink"
                    />
                    Em andamento
                  </label>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => appendEducation(emptyEducation)}
              className="w-fit cursor-pointer rounded-lg border border-ink bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-cream/40"
            >
              + Adicionar escolaridade
            </button>
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-default bg-white p-5">
            <h2 className="m-0 text-lg font-semibold text-ink">Habilidades</h2>
            {skillsError && <p role="alert" className="text-xs text-rose-700">{skillsError}</p>}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-neutral-600">
                  Adicionar habilidade
                </label>
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Ex: Excel, Atendimento..."
                  className="h-10 rounded-lg border border-default px-3 text-sm text-muted bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSkill}
                className="h-10 cursor-pointer rounded-lg border border-ink bg-white px-5 text-xs font-semibold text-ink transition-colors hover:bg-cream/40"
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((item, i) => (
                <button
                  key={`${item}-${i}`}
                  type="button"
                  onClick={() => handleRemoveSkill(i)}
                  className="cursor-pointer rounded-full border border-ink bg-cream/60 px-3 py-1 text-xs font-medium text-ink transition-colors hover:bg-ink hover:text-white"
                >
                  {item} ×
                </button>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={handleNextStep}
            className="w-full sm:w-fit cursor-pointer rounded-lg border border-ink bg-ink px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-95"
          >
            Continuar para experiências
          </button>
        </div>
      )}

      {step === "experience" && (
        <form
          onSubmit={handleSubmit(onSubmitFinal)}
          className="flex flex-col gap-5 mt-4"
        >
          {saveError && <p role="alert" className="text-sm text-rose-700">{saveError}</p>}
          <section className="flex flex-col gap-4 rounded-lg border border-default bg-white p-5">
            <h2 className="m-0 text-lg font-semibold text-ink">
              Experiências profissionais
            </h2>

            {experienceFields.map((field, index) => {
              const isCurrent = watch(`experiences.${index}.current`);
              const expErrors = errors.experiences?.[index];

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-4 border-b border-cream pb-4 last:border-none last:pb-0 sm:grid-cols-2"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase text-neutral-600">
                      Cargo *
                    </label>
                    <input
                      {...register(`experiences.${index}.role`, {
                        required: "Informe o cargo",
                      })}
                      className={`h-10 rounded-lg border px-3 text-sm text-muted bg-white ${expErrors?.role ? "border-rose-600" : "border-default"}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase text-neutral-600">
                      Empresa *
                    </label>
                    <input
                      {...register(`experiences.${index}.company`, {
                        required: "Informe a empresa",
                      })}
                      className={`h-10 rounded-lg border px-3 text-sm text-muted bg-white ${expErrors?.company ? "border-rose-600" : "border-default"}`}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm font-medium text-muted cursor-pointer sm:col-span-2">
                    <input
                      type="checkbox"
                      {...register(`experiences.${index}.current`)}
                      className="size-4 accent-ink"
                    />
                    Emprego atual
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase text-neutral-600">
                        Início *
                      </label>
                      <input
                        placeholder="MM/AAAA"
                        {...register(`experiences.${index}.start`, {
                          required: "Obrigatório",
                        })}
                        className="h-10 rounded-lg border border-default px-3 text-sm text-muted bg-white"
                      />
                    </div>
                    {!isCurrent && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase text-neutral-600">
                          Fim *
                        </label>
                        <input
                          placeholder="MM/AAAA"
                          {...register(`experiences.${index}.end`, {
                            required: !isCurrent,
                          })}
                          className="h-10 rounded-lg border border-default px-3 text-sm text-muted bg-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase text-neutral-600">
                      Modalidade *
                    </label>
                    <select
                      {...register(`experiences.${index}.modality`, {
                        required: true,
                      })}
                      className="h-10 rounded-lg border border-default px-3 text-sm text-muted bg-white"
                    >
                      <option value="">Selecione</option>
                      {["Presencial", "Híbrido", "Remoto"].map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold uppercase text-neutral-600">
                      Descrição das atividades
                    </label>
                    <textarea
                      rows={3}
                      {...register(`experiences.${index}.description`)}
                      className="rounded-lg border border-default p-3 text-sm text-muted bg-white"
                    />
                  </div>
                  {experienceFields.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Excluir experiência ${index + 1}`}
                      onClick={() => removeExperience(index)}
                      className="w-fit cursor-pointer rounded-lg border border-rose-600 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 sm:col-span-2 sm:justify-self-end"
                    >
                      Excluir experiência
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => appendExperience(emptyExperience)}
              className="w-fit cursor-pointer rounded-lg border border-ink bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-cream/40"
            >
              + Adicionar experiência
            </button>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep("education")}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink bg-white px-6 text-sm font-semibold text-ink cursor-pointer transition-colors hover:bg-cream/40"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-action inline-flex min-h-11 items-center justify-center rounded-lg px-6 text-sm font-semibold enabled:cursor-pointer enabled:hover:brightness-95"
            >
              {isSubmitting ? "Salvando currículo…" : "Salvar currículo"}
            </button>
          </div>
        </form>
      )}

      {step === "saved" && (
        <div className="flex flex-col gap-5 mt-4">
          <section className="rounded-lg border border-emerald-600 bg-emerald-50 p-5 text-emerald-900">
            <h2 className="m-0 text-lg font-semibold">
              ✓ Currículo salvo com sucesso
            </h2>
            <p className="mt-1 mb-0 text-sm">
              Suas informações estão atualizadas e prontas para as próximas
              candidaturas.
            </p>
          </section>

          <Link
            href="/jobs"
            className="w-full sm:w-fit inline-flex min-h-11 items-center justify-center rounded-lg border border-ink bg-ink px-6 text-sm font-semibold text-white no-underline transition-all hover:brightness-95"
          >
            Buscar vagas
          </Link>
        </div>
      )}
    </div>
  );
}
