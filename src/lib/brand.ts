/**
 * Brand logos live in /public. Override paths via NEXT_PUBLIC_* env vars if needed.
 */
export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Sozo Diaspora",
  staffName: process.env.NEXT_PUBLIC_BRAND_STAFF_NAME ?? "Sozo Operations",
  clientPortalSubtitle: "Client portal",
  staffPortalSubtitle: "Staff portal",
  /** Client portal, marketing site, login */
  logoSrc:
    process.env.NEXT_PUBLIC_BRAND_LOGO ?? "/Frame%2024431-Photoroom.png",
  /** Staff / admin portal */
  logoStaffSrc:
    process.env.NEXT_PUBLIC_BRAND_LOGO_STAFF ??
    "/Sozo-Consulting-Logo-Bottom.png",
  logoAlt: process.env.NEXT_PUBLIC_BRAND_LOGO_ALT ?? "Sozo Diaspora",
} as const;

export type BrandLogoVariant = "portal" | "staff" | "marketing" | "footer";

export function getBrandLogoSrc(variant: BrandLogoVariant) {
  if (variant === "staff" || variant === "footer") return BRAND.logoStaffSrc;
  return BRAND.logoSrc;
}
