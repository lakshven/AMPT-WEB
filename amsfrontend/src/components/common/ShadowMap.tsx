import React, { useRef, useEffect } from "react";

const ShadowMap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const shadow = hostRef.current.attachShadow({ mode: "open" });
    const wrapper = document.createElement("div");
    shadow.appendChild(wrapper);

    wrapper.appendChild(
      (children as any).ref?.current || document.createElement("div")
    );
  }, [children]);

  return <div ref={hostRef} />;
};

export default ShadowMap;