/**
 * `device-datetime`: current date+time of the device requesting the API.
 *
 * Used to filter out past showtimes and handle territories with multiple time zones.
 * Location is irrelevant — API returns showtimes starting after device time.
 *
 * Standard: ISO 8601 WITHOUT timezone offset.
 * Format: `yyyy-mm-ddThh:mm:ss[.sss]` — `T` separator required, `.sss` optional.
 * Example: `2023-09-14T19:30:00.000`
 */

const DEVICE_DATETIME_RE =
  /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d{1,3})?$/;

export function isDeviceDateTime(value: string): boolean {
  const m = DEVICE_DATETIME_RE.exec(value);
  if (!m) return false;
  // Reject real-calendar impossibilities (e.g. 2023-02-30).
  const [, y, mo, d, h, mi, s] = m;
  const ms = m[7] ? Number(`0${m[7]}`) * 1000 : 0;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s), ms);
  return (
    dt.getFullYear() === Number(y) &&
    dt.getMonth() === Number(mo) - 1 &&
    dt.getDate() === Number(d) &&
    dt.getHours() === Number(h) &&
    dt.getMinutes() === Number(mi) &&
    dt.getSeconds() === Number(s)
  );
}

export function assertDeviceDateTime(value: string): void {
  if (!isDeviceDateTime(value)) {
    throw new Error(
      `GluClient requires headers["device-datetime"] as ISO 8601 without offset (yyyy-mm-ddThh:mm:ss[.sss]), got ${JSON.stringify(value)}`,
    );
  }
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

/** Format a Date as local `device-datetime` (no offset). Defaults to now. */
export function formatDeviceDateTime(date: Date = new Date()): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `.${pad(date.getMilliseconds(), 3)}`
  );
}

/** Current device time as `device-datetime` header value. */
export function nowDeviceDateTime(): string {
  return formatDeviceDateTime(new Date());
}
