const AUTH_STORAGE_KEY = "auria_wallet_auth";
const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");

interface BackendErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  data: unknown;

  constructor(status: number, message: string, code?: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string; accessToken?: string };
    return parsed.token ?? parsed.accessToken ?? null;
  } catch {
    return null;
  }
}

export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  requiresAuth?: boolean;
  idempotencyKey?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    requiresAuth = true,
    idempotencyKey,
    headers: customHeaders,
    ...rest
  } = options;

  const headers = new Headers(customHeaders);

  if (!headers.has("Content-Type") && body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (idempotencyKey) {
    headers.set("Idempotency-Key", idempotencyKey);
  }

  if (requiresAuth) {
    const token = getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${normalizedEndpoint}`, {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.",
      "NETWORK_ERROR",
    );
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const responseData = isJson
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    if (response.status === 401 && requiresAuth) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    const payload =
      typeof responseData === "object" && responseData !== null
        ? (responseData as BackendErrorPayload)
        : null;

    const errorCode = payload?.error?.code;
    const errorMessage =
      payload?.error?.message ||
      payload?.message ||
      `Error HTTP ${response.status}`;

    throw new ApiError(response.status, errorMessage, errorCode, responseData);
  }

  return responseData as T;
}

export const apiClient = {
  get: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "DELETE" }),
};
