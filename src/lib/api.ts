const TASK_API_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "/task-api";
const USER_API_URL =
  process.env.NEXT_PUBLIC_USER_API_URL?.trim().replace(/\/+$/, "") ||
  "http://localhost:8080";

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

export function isAuthenticated(): boolean {
  const token = getTokenFromCookie();
  return !!token && token.trim() !== "";
}

export function getUserProfile(): { name?: string; email?: string } {
  if (typeof window === "undefined") return {};

  try {
    const nameMatch = document.cookie.match(/(^|;\s*)userName=([^;]*)/);
    const emailMatch = document.cookie.match(/(^|;\s*)userEmail=([^;]*)/);

    const name = nameMatch ? decodeURIComponent(nameMatch[2]) : undefined;
    const email = emailMatch ? decodeURIComponent(emailMatch[2]) : undefined;

    if (!name) {
      const token = getTokenFromCookie();
      if (token) {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = JSON.parse(
          decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join(""),
          ),
        );
        return {
          name: jsonPayload.name,
          email: jsonPayload.sub || jsonPayload.email,
        };
      }
    }

    return { name, email };
  } catch (e) {
    return {};
  }
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

async function extractErrorMessage(response: Response): Promise<string> {
  const fallback = `Erro ${response.status} ao comunicar com o serviço.`;
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("text/html")) return fallback;

  const body = await response.text();
  if (!body) return fallback;

  if (contentType.includes("application/json")) {
    try {
      const data = JSON.parse(body);
      return data?.message || data?.error || fallback;
    } catch {
      return fallback;
    }
  }

  return body.trimStart().startsWith("<") ? fallback : body;
}

async function request<T>(
  baseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getTokenFromCookie();
  const isPublicUserRequest =
    path === "/api/auth/login" || path === "/api/register";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(!isPublicUserRequest && token
      ? { Authorization: `Bearer ${token}` }
      : {}),
    ...(init?.headers as Record<string, string>),
  };

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch (cause) {
    throw new Error("Não foi possível conectar ao serviço. Tente novamente em alguns instantes.", { cause });
  }

  if (
    (response.status === 401 || response.status === 403) &&
    !isPublicUserRequest
  ) {
    if (typeof window !== "undefined") {
      document.cookie = "token=; path=/; max-age=0";
      window.location.href = "/login";
    }
    throw new Error("Sessão expirada.");
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
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
  apply: (taskId: string) =>
    request<{ id: string; status: string }>(TASK_API_URL, "/applications", {
      method: "POST",
      body: JSON.stringify({ taskId }),
    }),
  myApplications: () =>
    request<
      { id: string; taskId: string; status: string; dateApplication: string }[]
    >(TASK_API_URL, "/applications/mine"),
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
      document.cookie = "token=; path=/; max-age=0";
      document.cookie = `token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;

      if (data.roles) {
        document.cookie = `roles=${JSON.stringify(data.roles)}; path=/; max-age=604800; SameSite=Lax`;
      }

      if (data.name) {
        document.cookie = `userName=${encodeURIComponent(data.name)}; path=/; max-age=604800; SameSite=Lax`;
      }

      if (data.email) {
        document.cookie = `userEmail=${encodeURIComponent(data.email)}; path=/; max-age=604800; SameSite=Lax`;
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
    return request<{ id: string; name: string; email: string }>(USER_API_URL, "/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  getProfile: () =>
    request<{ education: unknown[]; skills: string[]; experiences: unknown[] }>(
      USER_API_URL,
      "/users/me/profile",
    ),
  saveProfile: (profile: {
    education: unknown[];
    skills: string[];
    experiences: unknown[];
  }) =>
    request(USER_API_URL, "/users/me/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    }),
};
