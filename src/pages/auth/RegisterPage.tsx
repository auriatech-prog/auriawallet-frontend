import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import { authService } from "@/services/authService";
import { startGoogleSignIn } from "@/services/googleAuth";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordError(password: string): string | undefined {
  if (!password) return "La contraseña es obligatoria.";
  if (password.length < 8) return "Usá al menos 8 caracteres.";
  if (!/[A-Z]/.test(password)) return "Incluí al menos una letra mayúscula.";
  if (!/[0-9]/.test(password)) return "Incluí al menos un número.";
  return undefined;
}

function getRegisterError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "No pudimos crear tu cuenta. Intentá nuevamente.";
  }

  if (error.status === 0) {
    return "No pudimos confirmar el registro. Revisá tu conexión antes de volver a intentarlo.";
  }

  if (error.status === 409) {
    return "Ya existe una cuenta con ese email. Iniciá sesión o probá con otro.";
  }

  return (
    error.message ||
    "No pudimos crear tu cuenta. Revisá los datos e intentá nuevamente."
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-7.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a21.85 21.85 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.5-1.14 2.76-2.4 3.61v3h3.88c2.27-2.09 3.54-5.17 3.54-8.85Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.88-3c-1.08.72-2.45 1.16-4.06 1.16-3.12 0-5.77-2.11-6.72-4.96H1.21v3.1C3.19 21.39 7.28 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.29V6.61H1.21A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.21 5.39l4.07-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.28 0 3.19 2.61 1.21 6.61l4.07 3.1c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [canRetry, setCanRetry] = useState(false);

  const isBusy = isLoading || isGoogleLoading;

  useEffect(() => {
    const updateConnectionStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);

    return () => {
      window.removeEventListener("online", updateConnectionStatus);
      window.removeEventListener("offline", updateConnectionStatus);
    };
  }, []);

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      nextErrors.name = "El nombre es obligatorio.";
    } else if (name.length < 2) {
      nextErrors.name = "Ingresá al menos 2 caracteres.";
    }

    if (!email) {
      nextErrors.email = "El email es obligatorio.";
    } else if (!validateEmail(email)) {
      nextErrors.email = "Ingresá un email válido.";
    }

    const passwordError = getPasswordError(form.password);
    if (passwordError) nextErrors.password = passwordError;

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Confirmá tu contraseña.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    return nextErrors;
  }

  function handleChange(field: keyof FormState) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({
        ...current,
        [field]: undefined,
        ...(field === "password" ? { confirmPassword: undefined } : {}),
        general: undefined,
      }));
      setCanRetry(false);
    };
  }

  async function submitRegistration() {
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } catch (error) {
      setErrors({ general: getRegisterError(error) });
      setCanRetry(error instanceof ApiError && error.status === 0);
      setIsLoading(false);
      return;
    }

    try {
      const loginResponse = await authService.login({
        email: form.email.trim(),
        password: form.password,
      });
      setSession({
        token: loginResponse.accessToken,
        user: loginResponse.user,
      });
      navigate("/wallet", { replace: true });
    } catch {
      navigate("/login", {
        replace: true,
        state: {
          notice:
            "Tu cuenta se creó. Iniciá sesión con el email y la contraseña que registraste.",
        },
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitRegistration();
  }

  async function handleGoogleRegister() {
    if (!isOnline || isBusy) return;

    setIsGoogleLoading(true);
    setErrors({});
    setCanRetry(false);

    try {
      await startGoogleSignIn();
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "El registro con Google todavía no está configurado.",
      });
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-auria-page sm:px-4 sm:py-6">
      <div className="mx-auto flex min-h-dvh w-full max-w-110 flex-col bg-auria-cream sm:min-h-[calc(100dvh-3rem)] sm:rounded-3xl sm:border sm:border-auria-border sm:shadow-sm">
        <header className="flex items-center justify-between border-b border-auria-border/70 px-5 py-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-auria-ink no-underline"
            aria-label="AuriaWallet, inicio de sesión"
          >
            <span className="inline-flex items-center gap-1" aria-hidden="true">
              <i className="block h-5 w-2 -skew-x-18 rounded-xs bg-auria-lime" />
              <i className="block h-5 w-2 -skew-x-18 rounded-xs bg-auria-lime" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              AuriaWallet
            </span>
          </Link>

          <Link
            to="/login"
            replace
            className="text-sm font-medium text-auria-muted hover:text-auria-forest"
          >
            Iniciar sesión
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-between px-5 pt-6 pb-7">
          <div className="space-y-6">
            <section className="space-y-1 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-auria-forest">
                Creá tu cuenta
              </h1>
              <p className="text-sm text-auria-muted">
                Comprá, vendé y convertí. Todo desde un mismo lugar.
              </p>
            </section>

            {!isOnline && (
              <p
                className="wrap-break-word rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                role="status"
                aria-live="polite"
              >
                Sin conexión a internet. Reconectate para crear tu cuenta.
              </p>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
              aria-busy={isBusy}
            >
              <Input
                label="Nombre completo"
                type="text"
                id="register-name"
                autoComplete="name"
                placeholder="Ej.: Nicolás García"
                value={form.name}
                onChange={handleChange("name")}
                error={errors.name}
                disabled={isBusy}
                maxLength={100}
                required
              />

              <Input
                label="Email"
                type="email"
                id="register-email"
                autoComplete="email"
                inputMode="email"
                placeholder="tucorreo@ejemplo.com"
                value={form.email}
                onChange={handleChange("email")}
                error={errors.email}
                disabled={isBusy}
                required
              />

              <Input
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                id="register-password"
                autoComplete="new-password"
                placeholder="Creá una contraseña"
                description="Al menos 8 caracteres, una mayúscula y un número."
                value={form.password}
                onChange={handleChange("password")}
                error={errors.password}
                disabled={isBusy}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isBusy}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    aria-pressed={showPassword}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-auria-muted transition hover:text-auria-forest focus-visible:outline-2 focus-visible:outline-auria-forest disabled:pointer-events-none disabled:opacity-50"
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                }
              />

              <Input
                label="Confirmar contraseña"
                type={showConfirmPassword ? "text" : "password"}
                id="register-confirm-password"
                autoComplete="new-password"
                placeholder="Repetí tu contraseña"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={errors.confirmPassword}
                disabled={isBusy}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isBusy}
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmación de contraseña"
                        : "Mostrar confirmación de contraseña"
                    }
                    aria-pressed={showConfirmPassword}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-auria-muted transition hover:text-auria-forest focus-visible:outline-2 focus-visible:outline-auria-forest disabled:pointer-events-none disabled:opacity-50"
                  >
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                }
              />

              {errors.general && (
                <p
                  className="wrap-break-word rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.general}
                </p>
              )}

              <div className="space-y-2.5 pt-2">
                <Button
                  type="submit"
                  className="min-h-12 w-full rounded-xl text-sm font-semibold"
                  isLoading={isLoading}
                  disabled={!isOnline || isGoogleLoading}
                >
                  {isLoading ? "Creando cuenta…" : "Crear cuenta"}
                </Button>

                {canRetry && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-11 w-full rounded-xl text-sm font-semibold"
                    onClick={() => void submitRegistration()}
                    disabled={!isOnline || isBusy}
                  >
                    Reintentar registro
                  </Button>
                )}

                <div className="relative py-1">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-auria-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-auria-cream px-2.5 text-auria-muted">
                      o continuá con
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleGoogleRegister()}
                  disabled={!isOnline || isBusy}
                  className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-auria-border bg-auria-card px-4 text-sm font-semibold text-auria-ink shadow-2xs transition hover:bg-auria-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <GoogleIcon />
                  <span>
                    {isGoogleLoading
                      ? "Redirigiendo a Google…"
                      : "Registrarse con Google"}
                  </span>
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-auria-muted">
              ¿Ya tenés una cuenta?{" "}
              <Link
                to="/login"
                replace
                className="font-semibold text-auria-forest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-auria-forest"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>

          <footer className="mt-8 border-t border-auria-border/70 pt-4 text-center text-xs text-auria-muted">
            Operaciones simuladas en USD, EUR y ARS.
          </footer>
        </main>
      </div>
    </div>
  );
}
