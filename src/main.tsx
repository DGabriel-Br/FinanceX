import React from "react";
import { createRoot } from "react-dom/client";
// Validate environment variables early - will throw if invalid
import '@/infra/config/env';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
