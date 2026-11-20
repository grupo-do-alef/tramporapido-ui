"use client";

import { useSyncExternalStore } from "react";
import { getUserRoles, isAuthenticated } from "./api";

function subscribe(onChange: () => void) {
  window.addEventListener("focus", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("focus", onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useSession() {
  const cookie = useSyncExternalStore(subscribe, () => document.cookie, () => "");
  return {
    isAuthorized: cookie !== "" && isAuthenticated(),
    isEmployer: cookie !== "" && getUserRoles().some((role) => role.toUpperCase().includes("EMPLOYER")),
  };
}
