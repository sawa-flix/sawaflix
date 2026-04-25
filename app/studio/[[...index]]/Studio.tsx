"use client";

import React from "react";

// Shim for useEffectEvent - required for Sanity v5 compatibility with Next.js 15
if (typeof (React as any).useEffectEvent === "undefined") {
  (React as any).useEffectEvent = (fn: any) => {
    const ref = React.useRef(fn);
    if (typeof window !== "undefined") {
      React.useLayoutEffect(() => {
        ref.current = fn;
      });
    }
    return React.useCallback((...args: any[]) => ref.current(...args), []);
  };
}

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export default function Studio() {
  return (
    <div style={{ height: "100vh", width: "100%", position: "fixed", top: 0, left: 0, zIndex: 9999 }}>
      <NextStudio config={config} />
    </div>
  );
}
