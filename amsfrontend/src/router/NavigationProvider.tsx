import React, { createContext, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";

const NavigationContext = createContext(null);

export const NavigationProvider = ({ children }) => {
  const navigate = useNavigate();
  const navigateRef = useRef(null);
 // Store navigate only once to avoid infinite re-renders
  if (navigateRef.current === null) {
    navigateRef.current = navigate;
  }
  return (
    <NavigationContext.Provider value={navigateRef}>
      {children}
    </NavigationContext.Provider>
  );
};

// ⭐ MUST be named like a hook because it uses useContext
export const useNavigator = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("NavigationProvider missing");
  return ctx.current;
};