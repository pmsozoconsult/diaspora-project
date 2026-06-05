import { Building2, Briefcase, Banknote, Scale, type LucideIcon } from "lucide-react";

export const SERVICE_CATEGORY_ORDER = [
  "Property & assets",
  "Banking",
  "Legal & business",
  "Other",
] as const;

export type ServiceCategoryName = (typeof SERVICE_CATEGORY_ORDER)[number] | string;

export type ServiceCategoryVisual = {
  icon: LucideIcon;
  accent: string;
  description: string;
};

const CATEGORY_VISUALS: Record<string, ServiceCategoryVisual> = {
  "Property & assets": {
    icon: Building2,
    accent: "from-emerald-600 to-teal-700",
    description: "Land, property titles, and asset verification",
  },
  Banking: {
    icon: Banknote,
    accent: "from-blue-600 to-indigo-700",
    description: "Accounts, transfers, and diaspora banking",
  },
  "Legal & business": {
    icon: Scale,
    accent: "from-amber-600 to-orange-700",
    description: "Registration, licensing, and compliance",
  },
};

const DEFAULT_CATEGORY_VISUAL: ServiceCategoryVisual = {
  icon: Briefcase,
  accent: "from-brand-600 to-brand-800",
  description: "Additional services from our team",
};

export function getCategoryVisual(category: string): ServiceCategoryVisual {
  return CATEGORY_VISUALS[category] ?? DEFAULT_CATEGORY_VISUAL;
}

const FALLBACK_CATEGORY_BY_NAME: Record<string, string> = {
  "Property title verification": "Property & assets",
  "Bank account facilitation": "Banking",
  "Business registration support": "Legal & business",
};

export function resolveServiceCategory(service: {
  category?: string | null;
  name: string;
}): string {
  const fromDb = (service.category ?? "").trim();
  if (fromDb && fromDb !== "Other") return fromDb;
  return FALLBACK_CATEGORY_BY_NAME[service.name] ?? (fromDb || "Other");
}

export function groupServicesByCategory<
  T extends { category?: string | null; name: string; sortOrder: number },
>(services: T[]): { category: string; services: T[] }[] {
  const byCategory = new Map<string, T[]>();

  for (const service of services) {
    const category = resolveServiceCategory(service);
    const list = byCategory.get(category) ?? [];
    list.push(service);
    byCategory.set(category, list);
  }

  const groups = Array.from(byCategory.entries()).map(([category, items]) => ({
    category,
    services: [...items].sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  return groups.sort((a, b) => {
    const aIndex = SERVICE_CATEGORY_ORDER.indexOf(
      a.category as (typeof SERVICE_CATEGORY_ORDER)[number]
    );
    const bIndex = SERVICE_CATEGORY_ORDER.indexOf(
      b.category as (typeof SERVICE_CATEGORY_ORDER)[number]
    );
    const aOrder = aIndex === -1 ? SERVICE_CATEGORY_ORDER.length : aIndex;
    const bOrder = bIndex === -1 ? SERVICE_CATEGORY_ORDER.length : bIndex;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.category.localeCompare(b.category);
  });
}
