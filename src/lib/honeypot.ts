export function isHoneypotTripped(value: unknown) {
  return String(value ?? "").trim().length > 0;
}
