import {
  Banknote,
  Briefcase,
  Building2,
  Scale,
  type LucideIcon,
} from "lucide-react";

export type ServiceVisual = {
  icon: LucideIcon;
  accent: string;
  tagline: string;
};

const BY_NAME: Record<string, ServiceVisual> = {
  "Property title verification": {
    icon: Building2,
    accent: "from-emerald-600 to-teal-700",
    tagline: "Property & assets",
  },
  "Bank account facilitation": {
    icon: Banknote,
    accent: "from-blue-600 to-indigo-700",
    tagline: "Banking",
  },
  "Business registration support": {
    icon: Scale,
    accent: "from-amber-600 to-orange-700",
    tagline: "Legal & business",
  },
};

const DEFAULT_VISUAL: ServiceVisual = {
  icon: Briefcase,
  accent: "from-brand-600 to-brand-800",
  tagline: "Service",
};

export function getServiceVisual(name: string): ServiceVisual {
  return BY_NAME[name] ?? DEFAULT_VISUAL;
}
