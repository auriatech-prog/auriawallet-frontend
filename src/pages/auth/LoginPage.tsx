import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button, Card, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import { authService } from "@/services/authService";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginLocationState {
  from?: { pathname?: string };
  notice?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getLoginError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "No pudimos iniciar sesión. Intentá nuevamente.";
  }

  if (error.status === 0) {
    return "No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente.";
  }

  if (error.status === 401) {
    return "El email o la contraseña no son correctos.";
  }

  return error.message || "No pudimos iniciar sesión. Intentá nuevamente.";
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const locationState = location.state as LoginLocationState | null;
  const destination = locationState?.from?.pathname ?? "/wallet";

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    const email = form.email.trim();

    if (!email) {
      nextErrors.email = "El email es obligatorio.";
    } else if (!validateEmail(email)) {
      nextErrors.email = "Ingresá un email válido.";
    }

    if (!form.password) {
      nextErrors.password = "La contraseña es obligatoria.";
    }

    return nextErrors;
  }

  function handleChange(field: keyof FormState) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined, general: undefined }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.login({
        email: form.email.trim(),
        password: form.password,
      });
      setSession({ token: response.accessToken, user: response.user });
      navigate(destination, { replace: true });
    } catch (error) {
      setErrors({ general: getLoginError(error) });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-auria-page px-4 py-10">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-2 text-auria-ink no-underline"
            aria-label="AuriaWallet, inicio de sesión"
          >
            <span className="inline-flex items-center gap-1" aria-hidden="true">
              <i className="block h-5 w-2 -skew-x-18 rounded-xs bg-auria-lime" />
              <i className="block h-5 w-2 -skew-x-18 rounded-xs bg-auria-lime" />
            </span>
            <span className="text-xl font-bold tracking-tight">AuriaWallet</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-auria-forest">
            Ingresá a tu cuenta
          </h1>
          <p className="mt-2 text-sm text-auria-muted">
            Volvé a tus saldos y operaciones multimoneda.
          </p>
        </header>

        <Card className="border border-auria-border p-6 shadow-sm sm:p-8">
          {locationState?.notice && (
            <p
              className="mb-5 rounded-lg border border-auria-border bg-auria-cream px-4 py-3 text-sm text-auria-ink"
              role="status"
            >
              {locationState.notice}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
            aria-busy={isLoading}
          >
            <Input
              label="Email"
              type="email"
              id="login-email"
              autoComplete="email"
              inputMode="email"
              placeholder="tucorreo@ejemplo.com"
              value={form.email}
              onChange={handleChange("email")}
              error={errors.email}
              disabled={isLoading}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              id="login-password"
              autoComplete="current-password"
              placeholder="Ingresá tu contraseña"
              value={form.password}
              onChange={handleChange("password")}
              error={errors.password}
              disabled={isLoading}
              required
            />

            {errors.general && (
              <p className="text-sm text-red-700" role="alert" aria-live="polite">
                {errors.general}
              </p>
            )}

            <Button
              type="submit"
              className="min-h-12 w-full rounded-xl text-sm font-semibold"
              isLoading={isLoading}
            >
              {isLoading ? "Ingresando…" : "Iniciar sesión"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-auria-muted">
            ¿Todavía no tenés cuenta?{" "}
            <Link
              to="/register"
              className="font-semibold text-auria-forest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-auria-forest"
            >
              Crear cuenta
            </Link>
          </p>
        </Card>

        <p className="mt-6 text-center text-xs text-auria-muted">
          Tu billetera para USD, EUR y ARS.
        </p>
      </div>
    </main>
  );
}
