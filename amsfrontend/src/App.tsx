import React from "react";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppContent from "./AppContent";
import { PermissionsProvider } from "./auth/PermissionProvider";
import { NavigationProvider } from "./router/NavigationProvider";

function App() {
  return (
    <Router>
      <AuthProvider>
        <PermissionsProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </PermissionsProvider>
      </AuthProvider>
    </Router>
  );
}
export default App;
