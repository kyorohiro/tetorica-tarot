import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { isTauri } from './natives/native';
import { isPwaDistributionLocation } from './natives/pwa';
import { DialogProvider } from "./comps/useDialog";

if ("serviceWorker" in navigator && !isTauri() && isPwaDistributionLocation()) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", {
        scope: "./",
      });
      console.log("SW registered:", registration.scope);
    } catch (error) {
      console.error("SW registration failed:", error);
    }
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DialogProvider>
      <App />
    </DialogProvider>
  </React.StrictMode>,
);
