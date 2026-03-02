"use client";

import Link from "next/link";
import { PenTool, Link as LinkIcon, Settings, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboardClient({ postCount, linkCount }: { postCount: number, linkCount: number }) {
    const cards = [
        {
            title: "Makaleler",
            desc: `Blog yazılarını yönet. Toplam ${postCount} yazı var.`,
            href: "/admin/posts",
            icon: PenTool,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
            delay: 0.1
        },
        {
            title: "Hızlı Linkler",
            desc: `Sosyal medya ve diğer linkleri yönet. Toplam ${linkCount} link var.`,
            href: "/admin/links",
            icon: LinkIcon,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            delay: 0.2
        },
        {
            title: "Site Ayarları",
            desc: "Hakkımda kısmını, profil fotoğrafını ve tema metinlerini düzenle.",
            href: "/admin/settings",
            icon: Settings,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            delay: 0.3
        }
    ];

    return (
        <div className="max-w-5xl mx-auto py-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-4xl font-bold font-serif text-white tracking-tight italic uppercase tracking-[0.05em]">Yönetim Paneli</h1>
                <p className="text-zinc-500 text-sm mt-3 font-medium max-w-xl leading-relaxed">Sitenizin tüm kontrolü burada. İçerikleri yönetin ve performansınızı takip edin.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {cards.map((card) => (
                    <motion.div
                        key={card.href}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: card.delay }}
                    >
                        <Link href={card.href} className="flex flex-col h-full p-8 rounded-[40px] border border-zinc-800 bg-[#0e0e0e] hover:border-zinc-700 transition-all group relative overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] active:scale-[0.98]">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

                            <div className={`w-16 h-16 rounded-2xl ${card.bgColor} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-white/5`}>
                                <card.icon className={`w-8 h-8 ${card.color}`} />
                            </div>

                            <h2 className="text-2xl font-bold text-zinc-100 mb-3 group-hover:text-white transition-colors">{card.title}</h2>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-10 flex-1 group-hover:text-zinc-400 transition-colors">{card.desc}</p>

                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-amber-500 transition-all">
                                Yönetmeye Başla <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Stats / Quick Summary Placeholder */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-16 p-8 rounded-[40px] border border-zinc-900 bg-zinc-950/50 flex flex-col md:flex-row items-center justify-between gap-8"
            >
                <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                        <Sparkles className="text-amber-500" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-zinc-200">Hoş geldin, Bahadır</h3>
                        <p className="text-zinc-500 text-sm italic">Bugün yeni bir şeyler yazmaya ne dersin?</p>
                    </div>
                </div>
                <Link href="/admin/posts/new" className="px-8 py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition-all shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)]">
                    YENİ MAKALE OLUŞTUR
                </Link>
            </motion.div>
        </div>
    );
}

const Sparkles = ({ className, size }: { className?: string, size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size} height={size}
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        className={className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);
