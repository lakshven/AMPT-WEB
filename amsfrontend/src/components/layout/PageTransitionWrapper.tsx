import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PageTransitionWrapper({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === "fadeOut") {
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [transitionStage, location]);

  return (
    <div
      className={`transition-all duration-150 ${
        transitionStage === "fadeIn"
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-1"
      }`}
    >
      {children}
    </div>
  );
}