import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { DashboardLayout } from "./components/dashboard-layout";
import { DashboardPage } from "./components/dashboard-page";
import { ClientsPage } from "./components/clients-page";
import { ClientListsPage } from "./components/client-lists-page";
import { CampaignsPage } from "./components/campaigns-page";
import { LeadsPage } from "./components/leads-page";
import { CallLogsPage } from "./components/call-logs-page";
import { AppointmentsPage } from "./components/appointments-page";
import { SettingsPage } from "./components/settings-page";
import { PhoneNumbersPage } from "./components/phone-numbers-page";
import { LandingPage } from "./components/landing-page";
import { BrandPage } from "./components/brand-page";
import { SignInPage } from "./components/signin-page";
import { SignUpPage } from "./components/signup-page";
import { ForgotPasswordPage } from "./components/forgot-password-page";
import { ResetPasswordPage } from "./components/reset-password-page";
import { VerifyEmailPage } from "./components/verify-email-page";
import { HelpSupportPage } from "./components/help-support-page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/home" element={<LandingPage />} />
        <Route path="/brand" element={<BrandPage />} />

        {/* Auth pages */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Admin Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="client-lists" element={<ClientListsPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="call-logs" element={<CallLogsPage />} />
          <Route path="phone-numbers" element={<PhoneNumbersPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpSupportPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
