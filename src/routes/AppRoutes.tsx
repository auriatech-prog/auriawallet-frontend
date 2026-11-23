import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ConversionPage } from '../pages/operations/ConversionPage';
import { PurchaseSalePage } from '../pages/operations/PurchaseSalePage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { TransactionConfirmationPage } from '../pages/transaction-confirmation/TransactionConfirmationPage';
import { TransactionHistoryPage } from '../pages/transaction-history/TransactionHistoryPage';
import { WalletHomePage } from '../pages/wallet/WalletHomePage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
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

        {/* Redirección por defecto y rutas no encontradas */}
        <Route path="/" element={<Navigate to="/wallet" replace />} />
        <Route path="*" element={<Navigate to="/wallet" replace />} />
      </Routes>
    </BrowserRouter>
  );
}