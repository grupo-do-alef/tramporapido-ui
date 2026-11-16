const TASK_API_URL = process.env.NEXT_PUBLIC_TASK_API_URL ?? "";
const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL ?? "";

export type Task = {
  id: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  status: "OPEN" | "ONGOING" | "FINISHED" | "CANCELED";
  modality: "HYBRID" | "HOME_OFFICE" | "IN_PERSON";
  dateTimeOpen?: string;
  dateTimeClosed?: string;
  dateTimeCriation?: string;
  income?: number;
};

function getTokenFromCookie(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[2]) : null;
}

export function getUserRoles(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const match = document.cookie.match(/(^|;\s*)roles=([^;]*)/);
    if (match) {
      const parsedRoles = JSON.parse(decodeURIComponent(match[2]));
      if (Array.isArray(parsedRoles)) {
        return parsedRoles.map(String);
      }
    }

    const token = getTokenFromCookie();
    if (!token) return [];

    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);
    const rawRoles = payload.roles || payload.authorities || [];

    if (typeof rawRoles === "string") return [rawRoles];
    if (Array.isArray(rawRoles)) return rawRoles.map(String);

    return [];
  } catch (e) {
    return [];
  }
}

async function request<T>(
  baseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getTokenFromCookie();
  const isAuthRoute = path.includes("/auth/");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(!isAuthRoute && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string>),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if ((response.status === 401 || response.status === 403) && !isAuthRoute) {
    if (typeof window !== "undefined") {
      document.cookie = "token=; path=/; max-age=0";
      window.location.href = "/login";
    }
    throw new Error("Sessão expirada.");
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      body || `Erro ${response.status} ao comunicar com o serviço.`,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const taskApi = {
  list: () => request<Task[]>(TASK_API_URL, "/tasks"),
  create: (task: Omit<Task, "id"> & { idemployer?: string }) =>
    request<Task>(TASK_API_URL, "/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),
  getById: (id: string) => request<Task>(TASK_API_URL, `/tasks/${id}`),
};

export const userApi = {
  login: async (email: string, password: string) => {
    const data = await request<{
      accessToken: string;
      email: string;
      name: string;
      roles: string[];
    }>(USER_API_URL, "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data?.accessToken && typeof window !== "undefined") {
      document.cookie = `token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;

      if (data.roles) {
        document.cookie = `roles=${JSON.stringify(data.roles)}; path=/; max-age=604800; SameSite=Lax`;
      }
    }

    return data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    roles: ("WORKER" | "EMPLOYER")[];
  }) => {
    return request<any>(USER_API_URL, "/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
