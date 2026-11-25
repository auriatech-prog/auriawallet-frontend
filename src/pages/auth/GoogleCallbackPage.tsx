import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import {
  clearStoredGoogleCodeVerifier,
  getStoredGoogleCodeVerifier,
} from "../../services/googleAuth";

const MISSING_PARAMS_ERROR =
  "No se pudo validar el inicio de sesión con Google. Volvé a intentarlo desde el inicio de sesión.";

const EXCHANGE_FAILED_ERROR =
  "El enlace de autenticación expiró o no es válido. Por favor, volvé a iniciar sesión.";

function extractCodeFromHash(hash: string): string | null {
  const cleanHash = hash.replace(/^#/, "");
  if (!cleanHash) return null;

  const queryPart = cleanHash.includes("?")
    ? cleanHash.split("?")[1]
    : cleanHash;
  const params = new URLSearchParams(queryPart);
  return params.get("code");
}

function getInitialCallbackState(): {
  code: string | null;
  codeVerifier: string | null;
  initialError: string | null;
} {
  const code = extractCodeFromHash(window.location.hash);
  const codeVerifier = getStoredGoogleCodeVerifier();

  if (!code || !codeVerifier) {
    clearStoredGoogleCodeVerifier();
    return {
      code: null,
      codeVerifier: null,
      initialError: MISSING_PARAMS_ERROR,
    };
  }

  return {
    code,
    codeVerifier,
    initialError: null,
  };
}

export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const hasExchangedRef = useRef(false);
  const [callbackData] = useState(getInitialCallbackState);
  const [asyncErrorMessage, setAsyncErrorMessage] = useState<string | null>(
    null,
  );

  const errorMessage = callbackData.initialError ?? asyncErrorMessage;

  useEffect(() => {
    if (!callbackData.code || !callbackData.codeVerifier) return;
    if (hasExchangedRef.current) return;
    hasExchangedRef.current = true;

    const { code, codeVerifier } = callbackData;

    const completeGoogleLogin = async () => {
      try {
        const response = await authService.exchangeGoogleCode({
          code,
          codeVerifier,
        });

        setSession({
          token: response.accessToken,
          user: response.user,
        });

        clearStoredGoogleCodeVerifier();
        navigate("/wallet", { replace: true });
      } catch {
        clearStoredGoogleCodeVerifier();
        setAsyncErrorMessage(EXCHANGE_FAILED_ERROR);
      }
    };

    void completeGoogleLogin();
  }, [callbackData, navigate, setSession]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-auria-cream px-5 text-auria-ink">
      <div className="w-full max-w-md rounded-3xl border border-auria-border bg-auria-card p-6 text-center shadow-sm">
        {errorMessage ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-700">
              !
            </div>
            <h1 className="font-display text-xl font-bold text-auria-ink">
              Error al ingresar con Google
            </h1>
            <p className="text-sm leading-relaxed text-auria-muted">
              {errorMessage}
            </p>
            <Link
              to="/login"
              replace
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-auria-forest px-4 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <div
              aria-hidden="true"
              className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-auria-border border-t-auria-forest"
            />
            <h1 className="font-display text-lg font-bold text-auria-ink">
              Conectando tu cuenta de Google...
            </h1>
            <p className="text-xs text-auria-muted">
              Estamos verificando tu sesión en Auria Wallet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
