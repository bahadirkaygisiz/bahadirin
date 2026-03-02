import React from "react";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { Youtube, Instagram, Twitter, Mail, Link as LinkIcon, Book } from "lucide-react";
import { prisma } from "../lib/prisma";
import PostList from "./components/PostList";
import ScrollReveal from "./components/ScrollReveal";

const IconMapper = ({ name, className }: { name: string; className?: string }) => {
  switch (name.toLowerCase()) {
    case "youtube": return <Youtube className={className} />;
    case "instagram": return <Instagram className={className} />;
    case "twitter":
    case "x": return <Twitter className={className} />;
    case "mail": return <Mail className={className} />;
    case "book": return <Book className={className} />;
    default: return <LinkIcon className={className} />;
  }
};

export default async function Home() {
  const links = await prisma.link.findMany({ orderBy: { order: "asc" } });
  const posts = await prisma.post.findMany({
    orderBy: { order: "asc" },
    where: { published: true }
  });

  const aboutContent = await prisma.setting.findUnique({ where: { key: "ABOUT_ME" } });
  const aboutImageUrl = await prisma.setting.findUnique({ where: { key: "ABOUT_IMAGE_URL" } });

  // Hero section — admin-editable settings
  const heroTitleSetting = await prisma.setting.findUnique({ where: { key: "HERO_TITLE" } });
  const heroQuoteSetting = await prisma.setting.findUnique({ where: { key: "HERO_QUOTE" } });
  const heroDescriptionSetting = await prisma.setting.findUnique({ where: { key: "HERO_DESCRIPTION" } });
  const heroTitleSizeSetting = await prisma.setting.findUnique({ where: { key: "HERO_TITLE_SIZE" } });
  const heroTitleFontSetting = await prisma.setting.findUnique({ where: { key: "HERO_TITLE_FONT" } });
  const heroQuoteSizeSetting = await prisma.setting.findUnique({ where: { key: "HERO_QUOTE_SIZE" } });
  const heroQuoteFontSetting = await prisma.setting.findUnique({ where: { key: "HERO_QUOTE_FONT" } });
  const heroDescSizeSetting = await prisma.setting.findUnique({ where: { key: "HERO_DESC_SIZE" } });
  const heroDescFontSetting = await prisma.setting.findUnique({ where: { key: "HERO_DESC_FONT" } });

  const heroTitle = heroTitleSetting?.value || "BAHADIR KAYGISIZ";
  const heroQuote = heroQuoteSetting?.value || "Her gün daha iyiye";
  const heroDescription = heroDescriptionSetting?.value || "Kişisel gelişim, psikoloji, felsefe ve hareketli yaşam üzerine yazıyor ve youtube videosu paylaşıyorum.";
  const heroTitleClass = `${heroTitleSizeSetting?.value || "text-xl md:text-3xl"} ${heroTitleFontSetting?.value || "font-mono"} uppercase text-zinc-400 tracking-[0.5em]`;
  const heroQuoteClass = `${heroQuoteSizeSetting?.value || "text-6xl md:text-[110px] lg:text-[140px]"} ${heroQuoteFontSetting?.value || "font-black"} tracking-tighter leading-[0.85] text-white uppercase`;
  const heroDescClass = `${heroDescSizeSetting?.value || "text-lg md:text-xl lg:text-2xl"} ${heroDescFontSetting?.value || "font-medium"} text-zinc-500 leading-relaxed max-w-3xl`;

  return (
    <main className="min-h-screen bg-black text-white selection:bg-amber-500/30 selection:text-amber-200">
      {/* ── Dan Koe Style Hero Section (admin-editable) ── */}
      <section className="h-[80vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black -z-10" />

        <ScrollReveal delay={200} className="text-center max-w-6xl mx-auto flex flex-col items-center gap-12">
          {/* Tier 1: Name */}
          <span className={heroTitleClass}>
            {heroTitle}
          </span>

          {/* Tier 2: Hero Quote */}
          <h2 className={heroQuoteClass}>
            {heroQuote}
          </h2>

          {/* Tier 3: Description */}
          <p className={heroDescClass}>
            {heroDescription}
          </p>
        </ScrollReveal>
      </section>

      {/* ── Main Content Container (Wider Layout) ── */}
      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-32">

        {/* Intro Section */}
        <ScrollReveal delay={100}>
          <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 border border-zinc-800/60 p-8 md:p-16 rounded-[40px] bg-zinc-950/30 backdrop-blur-sm shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col items-center md:items-start gap-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-2 border-zinc-800 bg-zinc-900 overflow-hidden shrink-0 rotate-3 transition-transform hover:rotate-0 duration-500 shadow-2xl">
                <img src="/avatar.jpg" alt="Bahadır Kaygısız" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2 text-zinc-100 italic">Bahadır Kaygısız</h1>
                <p className="text-zinc-500 text-sm tracking-widest uppercase font-sans">düşünceler &amp; vizyon</p>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xl md:text-2xl text-zinc-400 font-serif leading-relaxed italic border-l-2 border-amber-500/30 pl-8">
                Psikoloji, felsefe ve kişisel gelişim üzerine derinleşiyorum. Kendi yolculuğumda öğrendiklerimi, ürettiğim içeriklerle paylaşıyorum.
              </p>
              <p className="mt-8 text-zinc-600 font-mono text-sm tracking-tighter">bahadirin.com — 2026</p>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Links Section (Premium Grid) ── */}
        <section>
          <ScrollReveal delay={100}>
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-3xl font-bold font-serif italic">Hızlı Erişim</h2>
              <div className="h-px flex-1 bg-zinc-800/50" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link, idx) => (
              <ScrollReveal key={link.id} delay={idx * 100}>
                <Link
                  href={link.url}
                  target={link.url.startsWith('mailto:') ? "_self" : "_blank"}
                  className="neon-border group relative flex items-center gap-4 p-6 rounded-2xl bg-zinc-900/20 backdrop-blur hover:bg-zinc-900/50 transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 transition-colors border border-zinc-800">
                    <IconMapper name={link.icon || 'link'} className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-zinc-200 group-hover:text-white transition-colors">{link.title}</span>
                    <span className="text-[10px] text-zinc-600 font-mono tracking-tighter">KEŞFET →</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Blog Section ── */}
        <section>
          <ScrollReveal delay={100}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <h2 className="text-4xl font-black font-serif italic mb-4">Blog Yazılarım</h2>
                <p className="text-zinc-500 max-w-md">Psikoloji, strateji ve felsefe odaklı haftalık düşünceler ve notlar.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-12 h-1 bg-amber-500 rounded-full" />
                <span className="w-4 h-1 bg-zinc-800 rounded-full" />
              </div>
            </div>
          </ScrollReveal>

          {posts.length > 0 ? (
            <PostList posts={posts} />
          ) : (
            <p className="text-zinc-600 italic">Henüz bir yazı yayınlanmadı.</p>
          )}
        </section>

        {/* ── About Me Section ── */}
        <ScrollReveal delay={150}>
          <section className="relative rounded-[50px] overflow-hidden bg-zinc-950 border border-zinc-900 p-8 md:p-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -z-10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="text-center lg:text-left order-2 lg:order-1">
                <h2 className="text-3xl font-bold font-serif mb-8 italic">Hakkımda</h2>
                <div className="prose prose-invert max-w-none text-zinc-400 leading-loose">
                  <p>{aboutContent?.value}</p>
                </div>
              </div>
              {aboutImageUrl?.value && (
                <div className="order-1 lg:order-2">
                  <div className="relative w-full aspect-square md:w-80 md:mx-auto lg:w-full max-w-md mx-auto">
                    <img
                      src={aboutImageUrl.value}
                      alt="About"
                      className="w-full h-full object-cover rounded-[40px] grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
                    />
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 border-8 border-black rounded-[40px] overflow-hidden -z-10" />
                  </div>
                </div>
              )}
            </div>
          </section>
        </ScrollReveal>

        {/* ── Footer ── */}
        <footer className="pt-24 pb-8 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-zinc-900">
          <div className="flex items-center gap-6">
            <a href="https://instagram.com/bahadir.in" target="_blank" className="text-zinc-600 hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href="https://x.com/bahadirkaygisiz" target="_blank" className="text-zinc-600 hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="mailto:bahadirkaygisiz1@gmail.com" className="text-zinc-600 hover:text-white transition-colors"><Mail size={20} /></a>
          </div>
          <div className="text-center md:text-right">
            <p className="text-zinc-600 text-xs font-mono">© {new Date().getFullYear()} ARCHITECTED BY ANTIGRAVITY</p>
            <p className="text-zinc-800 text-[10px] mt-1 tracking-[0.3em] uppercase">Built for Growth</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
