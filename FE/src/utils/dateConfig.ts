let _timezone = "Asia/Ho_Chi_Minh";
let _dateFormat = "DD/MM/YYYY";

export const dateConfig = {
  get timezone() { return _timezone; },
  get dateFormat() { return _dateFormat; },
  get dateTimeFormat() { return `${_dateFormat} HH:mm`; },
  set(tz: string, fmt: string) {
    _timezone = tz || "Asia/Ho_Chi_Minh";
    _dateFormat = fmt || "DD/MM/YYYY";
  },
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatInTz(
  value: string | Date,
  tz: string,
  fmt: string,
): string {
  const d = typeof value === "string" ? new Date(value) : value;
  let resolvedTz = tz || "Asia/Ho_Chi_Minh";
  try { Intl.DateTimeFormat(undefined, { timeZone: resolvedTz }); } catch { resolvedTz = "Asia/Ho_Chi_Minh"; }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: resolvedTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }

  return fmt
    .replace("YYYY", map.year ?? "")
    .replace("MM", map.month ?? "")
    .replace("DD", map.day ?? "")
    .replace("HH", map.hour ?? "")
    .replace("mm", map.minute ?? "")
    .replace("ss", map.second ?? "");
}
