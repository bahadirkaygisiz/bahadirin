"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    PenTool,
    Link as LinkIcon,
    Settings,
    Home,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { icon: LayoutDashboard, label: "Gösterge Paneli", href: "/admin", color: "text-blue-400" },
    { icon: PenTool, label: "Makaleler", href: "/admin/posts", color: "text-amber-400" },
    { icon: LinkIcon, label: "Hızlı Linkler", href: "/admin/links", color: "text-emerald-400" },
    { icon: Settings, label: "Ayarlar", href: "/admin/settings", color: "text-purple-400" },
];

export default function AdminSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("admin-sidebar-collapsed");
        if (saved !== null) setIsCollapsed(saved === "true");
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("admin-sidebar-collapsed", String(newState));
    };

    if (!mounted) return <aside className="w-64 border-r border-zinc-800 bg-[#060606]" />;

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 100 : 280 }}
            className="hidden md:flex flex-col border-r border-zinc-900 bg-[#060606] relative h-screen sticky top-0 transition-all duration-500 ease-in-out z-50"
        >
            {/* Logo area */}
            <div className="p-8 mb-4">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform">
                        <Sparkles className="text-white fill-white/20" size={20} />
                    </div>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-serif font-black text-xl text-zinc-100 tracking-tighter italic"
                        >
                            Bahadır<span className="text-amber-500">.</span>In
                        </motion.div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-4 p-4 rounded-2xl transition-all relative ${isActive
                                    ? 'bg-zinc-900 text-white border border-zinc-800 shadow-xl'
                                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40'
                                }`}
                        >
                            <div className={`p-1 shrink-0 ${isActive ? item.color : 'group-hover:text-white transition-colors'}`}>
                                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-bold text-sm tracking-tight"
                                >
                                    {item.label}
                                </motion.span>
                            )}

                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-dot"
                                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)]"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Toggle */}
            <div className="p-4 border-t border-zinc-900/50 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-4 p-4 rounded-2xl text-zinc-500 hover:text-white hover:bg-zinc-900/40 transition-all group"
                >
                    <div className="shrink-0 group-hover:rotate-12 transition-transform">
                        <Home size={20} />
                    </div>
                    {!isCollapsed && <span className="font-bold text-xs uppercase tracking-[0.2em]">Siteye Dön</span>}
                </Link>

                <button
                    onClick={toggleCollapse}
                    className="w-full flex items-center justify-center p-4 rounded-2xl bg-zinc-950 border border-zinc-900 text-zinc-600 hover:text-white hover:border-zinc-800 transition-all group"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : (
                        <div className="flex items-center gap-3">
                            <ChevronLeft size={18} />
                            <span className="font-black text-[10px] uppercase tracking-widest">Paneli Daralt</span>
                        </div>
                    )}
                </button>
            </div>

            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-500/5 pointer-events-none -z-10 opacity-30" />
        </motion.aside>
    );
}
