import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/layout/Navbar";
import Login from "./components/auth/login";
import Signup from "./components/auth/Signup";
import Summary from "./components/Dashboard/Summary";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

import LandingPage from "./components/common/LandingPage";
import Startup from "./pages/StartupPage";

import AssetLog from "./components/AssetLog/AssetLog";
import { PopupProvider } from "./context/PopupContext";
import DashboardPage from "./components/Dashboard/DashboardPage";

import AdminDashboard from "./pages/AdminDashboard";

import RoleGuard from "./components/auth/RoleGuard";
import RedirectAfterLogin from "./components/auth/RedirectAfterLogin";

import IssueListPage from "./pages/issues/IssueListPage";
import CreateIssue from "./pages/issues/CreateIssue";
import IssueDetails from "./pages/issues/IssueDetails";
import UpdateIssue from "./pages/issues/UpdateIssue";
import AssignIssue from "./pages/issues/AssignIssue";
import CompleteIssue from "./pages/issues/CompleteIssue";
import DeleteIssue from "./pages/issues/DeleteIssue";

import UserListPage from "./pages/users/UserListPage";
import CreateUserPage from "./pages/users/CreateUserPage";
import EditUserPage from "./pages/users/EditUserPage";

import Breadcrumbs from "./components/common/Breadcrumbs";
import PageTransitionWrapper from "./components/layout/PageTransitionWrapper";

import AdminLayout from "./components/layout/AdminLayout";
import { adminSections } from "./config/adminSections";

// ⭐ Client Group Management Pages (3 subpages)
import CreateClientGroupPage from "./pages/ClientGroups/CreateClientGroupPage";
import ClientGroupListPage from "./pages/ClientGroups/ClientGroupListPage";
import VerifyInvitePage from "./pages/VerifyInvitePage";
import ClientGroupManagementNew from "./pages/ClientGroups/ClientGroupManagementNew";

// ⭐ Company Admin Pages
import CompanyAdminDashboard from "./pages/CompanyAdmin/CompanyAdminDashboard";
// import ManageUsers from "./pages/company-admin/ManageUsers";
import CompanyActivityLogs from "./pages/CompanyAdmin/CompanyActivityLogs";
import CompanyAnalytics from "./pages/CompanyAdmin/CompanyAnalytics";
import CompanySettings from "./pages/CompanyAdmin/CompanySettings";
import ClientGroupDashboardPage from "./pages/ClientGroups/ClientGroupDashboardPage";
const AppContent: React.FC = () => {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="text-white p-10 text-center text-xl">
        Loading...
      </div>
    );
  }
  const InviteRedirect = () => {
  const loc = useLocation();
  return <Navigate to={`/signup${loc.search}`} replace />;
  };
  return (
    <>
      {isAuthenticated && <Navbar />}
      {isAuthenticated && <Breadcrumbs />}

      <PageTransitionWrapper>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          {/* ⭐ FIX #1 — Signup must be public (backend already blocks unauthorized signup) */}
          <Route path="/signup" element={<Signup />} />

          {/* ⭐ FIX #2 — Redirect /invite → /signup?token=xxxx */}
          <Route path="/invite" element={<InviteRedirect/>} />

          <Route path="/redirect" element={<RedirectAfterLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Startup for single_user */}
          <Route
            path="/startup"
            element={
              isAuthenticated && role === "single_user"
                ? <Startup />
                : <Navigate to="/login" replace />
            }
          />
          {/* ✅ Onboarding route for first Client Group (single_user only) */}
          <Route
            path="/onboarding/create-group"
            element={
              isAuthenticated && role === "single_user"
                ? <CreateClientGroupPage />
                : <Navigate to="/dashboard" replace />
            }
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <>
                  <DashboardPage />
                  <Summary />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Asset Log */}
          <Route
            path="/asset-log"
            element={
              isAuthenticated ? (
                <PopupProvider>
                  <AssetLog role={role} />
                </PopupProvider>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* ⭐ Client Group Management INSIDE Admin Panel */}
          <Route
            path="/admin/client-groups"
            element={
              isAuthenticated && (role === "app_admin" || role === "company_admin")
                ? <AdminLayout />
                : <Navigate to="/dashboard" replace />
            }
          >
            <Route path="create" element={<CreateClientGroupPage />} />
            <Route path="list" element={<ClientGroupListPage />} />
            <Route path="manage-new" element={<ClientGroupManagementNew />} />
            <Route path=":groupId/dashboard" element={<ClientGroupDashboardPage />} />
            </Route>
          {/* ⭐ PUBLIC CLIENT GROUP ROUTES (Required for Company Admin Sidebar) */}
          <Route
            path="/client-groups"
            element={
              isAuthenticated && (role === "app_admin" || role === "company_admin")
                ? <ClientGroupListPage />
                : <Navigate to="/dashboard" replace />
            }
          />

          <Route
            path="/client-groups/create"
            element={
              isAuthenticated && (role === "app_admin" || role === "company_admin")
                ? <CreateClientGroupPage />
                : <Navigate to="/dashboard" replace />
            }
          />

          <Route
            path="/client-groups/:groupId"
            element={
              isAuthenticated && (role === "app_admin" || role === "company_admin")
                ? <ClientGroupManagementNew />
                : <Navigate to="/dashboard" replace />
            }
          />

          {/* ⭐ Unified Admin Layout (Sidebar + Nested Routes) */}
          <Route
            path="/admin"
            element={
              isAuthenticated && role === "app_admin"
                ? <AdminLayout />
                : <Navigate to="/dashboard" replace />
            }
          >
            <Route index element={<AdminDashboard />} />

            {adminSections.map(section => (
              <Route
                key={section.key}
                path={section.path}
                element={section.component}
              />
            ))}
          </Route>
                    {/* ⭐ COMPANY ADMIN MODULE */}
          <Route
            path="/company-admin"
            element={
              isAuthenticated && (role === "company_admin" || role === "company")
                ? <AdminLayout />
                : <Navigate to="/dashboard" replace />
            }
          >
            <Route index element={<CompanyAdminDashboard />} />
            {/* <Route path="users" element={<ManageUsers />} /> */}
            <Route path="activity" element={<CompanyActivityLogs />} />
            <Route path="analytics" element={<CompanyAnalytics />} />
            <Route path="settings" element={<CompanySettings />} />
          </Route>


          {/* Issues Module */}
          <Route
            path="/issues"
            element={isAuthenticated ? <IssueListPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/issues/create"
            element={isAuthenticated ? <CreateIssue /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/issues/:id"
            element={isAuthenticated ? <IssueDetails /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/issues/:id/edit"
            element={isAuthenticated ? <UpdateIssue /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/issues/:id/assign"
            element={isAuthenticated ? <AssignIssue /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/issues/:id/complete"
            element={isAuthenticated ? <CompleteIssue /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/issues/:id/delete"
            element={isAuthenticated ? <DeleteIssue /> : <Navigate to="/login" replace />}
          />

          {/* Users Module */}
          <Route
            path="/users"
            element={
              isAuthenticated ? (
                <RoleGuard allowed={["app_admin", "company_admin"]}>
                  <UserListPage />
                </RoleGuard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/users/create"
            element={
              isAuthenticated ? (
                <RoleGuard allowed={["app_admin", "company_admin"]}>
                  <CreateUserPage />
                </RoleGuard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/users/:id/edit"
            element={
              isAuthenticated ? (
                <RoleGuard allowed={["app_admin", "company_admin"]}>
                  <EditUserPage />
                </RoleGuard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </PageTransitionWrapper>
    </>
  );
};

export default AppContent;
