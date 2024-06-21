"use client";

import { useEffect } from "react";
import { log } from "@logtail/next";

export default function Logger() {
  useEffect(() => {
    function logError(event: ErrorEvent) {
      console.log("ERROR DETECTED");
      log.error(event.message, {
        error: event.error,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    }
    function logUnhandledRejection(event: PromiseRejectionEvent) {
      console.log("ERROR DETECTED");
      log.error("Unhandled Promise Rejection", { reason: event.reason });
    }

    window.addEventListener("error", logError);
    window.addEventListener("unhandledrejection", logUnhandledRejection);
    return () => {
      document.removeEventListener("error", logError);
    };
  }, []);

  return null;
}
