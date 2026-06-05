const DISPLAY_TZ = "Africa/Addis_Ababa";

function dateTimeFormatter() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: DISPLAY_TZ,
  });
}

function dateFormatter() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: DISPLAY_TZ,
  });
}

/** Stable SSR + client formatting (avoids hydration mismatch from server UTC vs browser local). */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return dateTimeFormatter().format(date);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return dateFormatter().format(date);
}
