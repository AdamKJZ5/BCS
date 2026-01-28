import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
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
        setTransitionStage("fadeIn");
        setDisplayLocation(location);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [transitionStage, location]);

  return (
    <div
      style={{
        animation:
          transitionStage === "fadeIn"
            ? "fadeIn 0.3s ease-out"
            : "fadeOut 0.15s ease-in",
        animationFillMode: "forwards",
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
