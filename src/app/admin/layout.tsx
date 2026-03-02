import Link from "next/link";
import { LayoutDashboard, PenTool, Link as LinkIcon, Settings, Home } from "lucide-react";
import { Toaster } from "react-hot-toast";

export const metadata = {
    title: "Yönetici Paneli - Bahadır Kaygısız",
    robots: { index: false, follow: false },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-zinc-300 flex flex-col md:flex-row">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#0a0a0a',
                        color: '#fff',
                        border: '1px solid #27272a',
                    },
                    success: {
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            {/* Sidebar for Navigation */}
            <aside className="w-full md:w-64 border-r border-zinc-800 bg-[#0a0a0a] p-6 flex flex-col justify-between">
                <div>
                    <div className="mb-10 font-serif font-bold text-2xl text-zinc-100 flex items-center gap-2">
                        Admin Panel
                    </div>
                    <nav className="flex flex-col gap-2">
                        <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/60 transition text-zinc-400 hover:text-zinc-100">
                            <LayoutDashboard size={18} />
                            Gösterge Paneli
                        </Link>
                        <Link href="/admin/posts" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/60 transition text-zinc-400 hover:text-zinc-100">
                            <PenTool size={18} />
                            Makaleler
                        </Link>
                        <Link href="/admin/links" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/60 transition text-zinc-400 hover:text-zinc-100">
                            <LinkIcon size={18} />
                            Linkler
                        </Link>
                        <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/60 transition text-zinc-400 hover:text-zinc-100">
                            <Settings size={18} />
                            Ayarlar
                        </Link>
                    </nav>
                </div>

                <Link href="/" className="flex items-center justify-center gap-2 p-4 mt-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors">
                    <Home size={16} />
                    Siteye Dön
                </Link>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-10 lg:p-16 max-h-screen overflow-y-auto bg-black">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
