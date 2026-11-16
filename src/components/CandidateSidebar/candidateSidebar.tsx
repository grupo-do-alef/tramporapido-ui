"use client";

import { getUserProfile } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CandidateSidebar() {
  const pathname = usePathname();
  const user = getUserProfile();

  const activeJobs = pathname?.startsWith("/jobs");
  const activeApplications = pathname?.startsWith("/applications");
  const activeResume = pathname?.startsWith("/resume");

  const isProfileComplete = Boolean(user?.name);

  return (
    <aside
      id="candidate-menu"
      className="w-full shrink-0 rounded-lg bg-[#ffeed2] p-4 sm:w-[204px]"
      lang="pt-BR"
    >
      <p className="m-0 mb-3 font-medium text-[#2d0f0f]">Seu próximo passo</p>

      <h2 className="m-0 text-2xl font-semibold text-[#925807]">
        {user?.name ? `Olá, ${user.name.split(" ")[0]}` : "Olá, visitante"}
      </h2>

      <nav aria-label="Área do candidato" className="mt-4 grid gap-3">
        <Link
          href="/jobs"
          aria-current={activeJobs ? "page" : undefined}
          className={`flex min-h-[44px] items-center justify-center rounded-lg border p-2 text-center font-medium no-underline transition-colors ${
            activeJobs
              ? "border-[#925807] bg-[#925807] text-white"
              : "border-[#925807] bg-white text-[#925807] hover:bg-[#ffeed2]/60"
          }`}
        >
          Buscar vagas
        </Link>

        <Link
          href="/applications"
          aria-current={activeApplications ? "page" : undefined}
          className={`flex min-h-[44px] items-center justify-center rounded-lg border p-2 text-center font-medium no-underline transition-colors ${
            activeApplications
              ? "border-[#925807] bg-[#925807] text-white"
              : "border-[#925807] bg-white text-[#925807] hover:bg-[#ffeed2]/60"
          }`}
        >
          Minhas candidaturas
        </Link>

        <Link
          href="/resume"
          aria-current={activeResume ? "page" : undefined}
          className={`flex min-h-[44px] items-center justify-center rounded-lg border p-2 text-center font-medium no-underline transition-colors ${
            activeResume
              ? "border-[#925807] bg-[#925807] text-white"
              : "border-[#925807] bg-white text-[#925807] hover:bg-[#ffeed2]/60"
          }`}
        >
          Perfil / Currículo
        </Link>
      </nav>

      {isProfileComplete ? (
        <p className="mt-4 mb-0 text-xs leading-4 text-[#2d0f0f]">
          <strong className="font-semibold">Currículo atualizado</strong>
          <br />
          Seus dados estão com você.
        </p>
      ) : (
        <p className="mt-4 mb-0 text-xs leading-4 font-medium text-red-600">
          <strong className="font-semibold">Currículo não preenchido</strong>
          <br />
          Complete seus dados no perfil.
        </p>
      )}
    </aside>
  );
}
