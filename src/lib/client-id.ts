export function getClientId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip ?? req.headers.get("x-real-ip") ?? "unknown";
}
