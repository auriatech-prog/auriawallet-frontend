import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "../components/layout/MainLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { WalletHomePage } from "../pages/wallet/WalletHomePage";
import { PurchaseSalePage } from "../pages/operations/PurchaseSalePage";
import { ConversionPage } from "../pages/operations/ConversionPage";
import { TransactionHistoryPage } from "../pages/transaction-history/TransactionHistoryPage";
import { TransactionConfirmationPage } from "../pages/transaction-confirmation/TransactionConfirmationPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
// import { UiShowcase } from "../pages/dev/UiShowcase";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas (sin navbar ni bottom nav) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas con Layout principal */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/wallet" element={<WalletHomePage />} />
            <Route path="/operations/buy-sell" element={<PurchaseSalePage />} />
            <Route path="/operations/convert" element={<ConversionPage />} />
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
