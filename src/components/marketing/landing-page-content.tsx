"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Building2,
  Scale,
  Banknote,
  FileCheck,
  Landmark,
  Shield,
  MessageSquare,
} from "lucide-react";
import { MarketingLink } from "@/components/layout/marketing-link";
import { MarketingImage } from "@/components/ui/marketing-image";
/** Unsplash URLs with ?w= only (auto=format URLs 404 on this server's image optimizer). */
const IMG = {
  hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
  card1: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  card2: "https://images.unsplash.com/photo-1521737710482-121fc6773ca4?w=800&q=80",
  card3: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
  howItWorks: "https://images.unsplash.com/photo-1486406146926-c627a92fd1ab?w=1920&q=70",
  poa: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
  cta: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80",
};

const steps = [
  {
    title: "Create your account",
    desc: "Register free. Pay only when you start power of attorney.",
  },
  {
    title: "Power of attorney",
    desc: "MOFA app, embassy routing, and dedicated POA chat with our team.",
  },
  {
    title: "Request services",
    desc: "After POA is on file, request services with separate per-case chat.",
  },
];

const services = [
  {
    icon: Building2,
    name: "Property & assets",
    tagline: "Land, homes, and rentals",
    desc: "We verify titles, coordinate transactions, and manage rentals on your behalf in Ethiopia.",
    features: [
      "Title deed & cadastral verification",
      "Purchase, sale, and transfer support",
      "Rental agreements and tenant coordination",
    ],
    accent: "from-emerald-600 to-teal-700",
  },
  {
    icon: Banknote,
    name: "Banking",
    tagline: "Accounts and cross-border finance",
    desc: "Diaspora-focused banking support including account opening guidance and remittance coordination.",
    features: [
      "Diaspora account setup assistance",
      "Remittance and FX guidance",
      "Loan and credit application support",
    ],
    accent: "from-blue-600 to-indigo-700",
  },
  {
    icon: Scale,
    name: "Legal & business",
    tagline: "Entities, compliance, representation",
    desc: "Business registration, regulatory compliance, and legal representation while you remain abroad.",
    features: [
      "Company registration & licensing",
      "Tax and regulatory compliance",
      "Court and agency representation",
    ],
    accent: "from-amber-600 to-orange-700",
  },
];

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LandingPageContent() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  return (
    <>
      <section ref={heroRef} className="relative min-h-[92vh] overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ y: heroImageY }}>
          <div className="relative h-full w-full">
            <Image
              src={IMG.hero}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/40" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="page-container relative z-10 flex min-h-[92vh] flex-col justify-center py-20"
        >
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700"
          >
            Sozo Consulting PLC
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Representation in Ethiopia, managed from abroad
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600"
          >
            A structured portal: power of attorney with MOFA and embassy support,
            then the services you need — each step visible.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <MarketingLink href="/register" variant="primary" className="group">
              Get started
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </MarketingLink>
            <MarketingLink href="/login" variant="secondary">
              Sign in
            </MarketingLink>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative -mt-16 bg-white pb-12 pt-4">
        <div className="page-container">
          <FadeIn>
            <div className="grid gap-4 md:grid-cols-3">
              {[IMG.card1, IMG.card2, IMG.card3].map((src, i) => (
                <motion.div
                  key={src}
                  whileHover={{ scale: 1.03, y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200/60"
                >
                  <MarketingImage
                    src={src}
                    alt={`Gallery ${i + 1}`}
                    className="object-cover transition duration-700 group-hover:scale-110"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 transition group-hover:opacity-100" />
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="how-it-works" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 z-0">
          <div className="relative h-full w-full">
            <MarketingImage src={IMG.howItWorks} alt="" sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-slate-900/75" />
        </div>
        <div className="page-container relative z-10 text-white">
          <FadeIn>
            <h2 className="text-center text-3xl font-bold sm:text-4xl">How it works</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg font-medium text-white/95">
              Three phases. One portal. Always know what comes next.
            </p>
          </FadeIn>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="rounded-2xl border border-white/15 bg-white/10 p-8 shadow-lg backdrop-blur-md transition hover:border-brand-300/40 hover:bg-white/15"
                >
                  <span className="text-5xl font-bold text-brand-300">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-xl font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-100">{s.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="bg-white py-24">
        <div className="page-container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn>
              <h2 className="text-3xl font-bold text-slate-900">After POA is complete</h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                Property, banking, legal, and more — each request has its own reference
                and chat thread, separate from your POA conversation.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Dedicated POA chat until mandate is registered",
                  "Per-request service chat and status updates",
                  "Sample POA PDF download in the portal",
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn delay={0.15}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative mx-auto aspect-[5/4] w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-200/80 lg:max-h-[360px]"
              >
                <MarketingImage
                  src={IMG.poa}
                  alt="Financial and property services"
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 400px"
                />
              </motion.div>
            </FadeIn>
          </div>

          <FadeIn className="mt-20">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                Service areas
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                What we handle on the ground
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                Each category is staffed by specialists in Ethiopia. You track progress,
                documents, and messages in one portal.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {services.map((s, i) => (
              <FadeIn key={s.name} delay={i * 0.08}>
                <motion.article
                  whileHover={{ y: -6 }}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md transition hover:shadow-xl"
                >
                  <div
                    className={`bg-gradient-to-r ${s.accent} px-6 py-5 text-white`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                          {s.tagline}
                        </p>
                        <h4 className="mt-1 text-xl font-bold">{s.name}</h4>
                      </div>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <s.icon className="h-6 w-6" />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-sm leading-relaxed text-slate-600">{s.desc}</p>
                    <ul className="mt-5 flex-1 space-y-2.5 border-t border-slate-100 pt-5">
                      {s.features.map((f) => (
                        <li key={f} className="flex gap-2 text-sm text-slate-700">
                          <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.article>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <div className="mt-14 grid gap-4 rounded-2xl bg-slate-50 p-6 sm:grid-cols-3 sm:p-8">
              {[
                { icon: Shield, label: "Verified representation", text: "Licensed team in Ethiopia" },
                { icon: MessageSquare, label: "Dedicated chat", text: "POA and per-request threads" },
                { icon: Landmark, label: "Embassy pathway", text: "MOFA and consular coordination" },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <item.icon className="h-5 w-5 shrink-0 text-brand-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 z-0">
          <div className="relative h-full w-full">
            <MarketingImage src={IMG.cta} alt="" sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-brand-900/70 to-slate-900/75" />
        </div>
        <FadeIn className="page-container relative z-10 text-center">
          <h2 className="text-3xl font-bold text-white drop-shadow-sm sm:text-4xl">
            Ready when you are
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/90">
            Create a free account and begin your power of attorney journey. One sign-in
            takes you to your dashboard — client or team — based on your account.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <MarketingLink
              href="/register"
              variant="primary"
              className="!bg-white !text-slate-900 !shadow-xl hover:!bg-brand-50 hover:!text-brand-900"
            >
              Create account
            </MarketingLink>
            <MarketingLink
              href="/login"
              variant="secondary"
              className="!border-white/50 !bg-white/10 !text-white backdrop-blur-sm hover:!border-white hover:!bg-white/20 hover:!text-white"
            >
              Sign in
            </MarketingLink>
          </div>
        </FadeIn>
      </section>

    </>
  );
}
