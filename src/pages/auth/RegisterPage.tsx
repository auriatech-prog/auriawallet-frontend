import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Card, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import { authService } from "@/services/authService";

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

  return error.message || "No pudimos crear tu cuenta. Revisá los datos e intentá nuevamente.";
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
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } catch (error) {
      setErrors({ general: getRegisterError(error) });
      setIsLoading(false);
      return;
    }

    try {
      const loginResponse = await authService.login({
        email: form.email.trim(),
        password: form.password,
      });
      setSession({ token: loginResponse.accessToken, user: loginResponse.user });
      navigate("/wallet", { replace: true });
    } catch {
      navigate("/login", {
        replace: true,
        state: {
          notice: "Tu cuenta se creó. Iniciá sesión con el email y la contraseña que registraste.",
        },
      });
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
            Creá tu cuenta
          </h1>
          <p className="mt-2 text-sm text-auria-muted">
            Empezá a organizar tus monedas en un solo lugar.
          </p>
        </header>

        <Card className="border border-auria-border p-6 shadow-sm sm:p-8">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
            aria-busy={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              id="register-password"
              autoComplete="new-password"
              placeholder="Creá una contraseña"
              description="Al menos 8 caracteres, una mayúscula y un número."
              value={form.password}
              onChange={handleChange("password")}
              error={errors.password}
              disabled={isLoading}
              required
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              id="register-confirm-password"
              autoComplete="new-password"
              placeholder="Repetí tu contraseña"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              error={errors.confirmPassword}
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
              {isLoading ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-auria-muted">
            ¿Ya tenés una cuenta?{" "}
            <Link
              to="/login"
              className="font-semibold text-auria-forest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-auria-forest"
            >
              Iniciar sesión
            </Link>
          </p>
        </Card>

        <p className="mt-6 text-center text-xs text-auria-muted">
          Operaciones simuladas en USD, EUR y ARS.
        </p>
      </div>
    </main>
  );
}
