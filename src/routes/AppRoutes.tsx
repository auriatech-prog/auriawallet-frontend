import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { MainLayout } from "../components/layout/MainLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { GoogleCallbackPage } from "../pages/auth/GoogleCallbackPage";
import { WalletHomePage } from "../pages/wallet/WalletHomePage";
import { OperationsHubPage } from "../pages/operations/OperationsHubPage";
import { AddMoneyPage } from "../pages/operations/AddMoneyPage";
import { SendMoneyPage } from "../pages/operations/SendMoneyPage";
import { ConversionPage } from "../pages/operations/ConversionPage";
import { TransactionHistoryPage } from "../pages/transaction-history/TransactionHistoryPage";
import { TransactionConfirmationPage } from "../pages/transaction-confirmation/TransactionConfirmationPage";
import { ProfilePage } from "../pages/profile/ProfilePage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Callback OAuth de Google (fuera de guards) */}
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

        {/* Rutas exclusivas para usuarios no autenticados */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Rutas protegidas con Layout principal */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/wallet" element={<WalletHomePage />} />
            <Route path="/operations" element={<OperationsHubPage />} />
            <Route path="/operations/add" element={<AddMoneyPage />} />
            <Route path="/operations/send" element={<SendMoneyPage />} />
            <Route path="/operations/convert" element={<ConversionPage />} />
            <Route
              path="/operations/buy-sell"
              element={<Navigate to="/operations" replace />}
            />
            <Route path="/transactions" element={<TransactionHistoryPage />} />
            <Route
              path="/transactions/confirmation"
              element={<TransactionConfirmationPage />}
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/wallet" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
