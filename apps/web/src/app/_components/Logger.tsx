"use client";

import { log } from "@logtail/next";
import { useEffect } from "react";

export default function Logger() {
  useEffect(() => {
    function logError(event: ErrorEvent) {
      console.log("ERROR DETECTED");
      log.error(event.message, {
        column: event.colno,
        line: event.lineno,
        url: event.filename,
      });
    }
    function logUnhandledRejection(event: PromiseRejectionEvent) {
      console.log("ERROR DETECTED");
      log.error("Unhandled Promise Rejection", {
        reason: event.reason as string,
      });
    }

    window.addEventListener("error", logError);
    window.addEventListener("unhandledrejection", logUnhandledRejection);
    return () => {
      document.removeEventListener("error", logError);
    };
  }, []);

  return null;
}
