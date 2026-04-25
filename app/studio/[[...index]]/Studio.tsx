"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export default function Studio() {
  return (
    <div style={{ height: "100vh", width: "100%", position: "fixed", top: 0, left: 0, zIndex: 9999 }}>
      <NextStudio config={config} />
    </div>
  );
}
