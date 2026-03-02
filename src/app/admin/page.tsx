import Link from "next/link";
import { PenTool, Link as LinkIcon, Settings, LayoutDashboard } from "lucide-react";
import { prisma } from "../../lib/prisma";

export default async function AdminDashboard() {
    const postCount = await prisma.post.count();
    const linkCount = await prisma.link.count();

    return (
        <div>
            <h1 className="text-3xl font-bold font-serif mb-8 text-zinc-100">Yönetim Paneli</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/posts" className="p-6 rounded-2xl border border-zinc-800 bg-[#0e0e0e] hover:bg-zinc-800/50 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PenTool className="w-6 h-6 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-200 mb-2">Makaleler</h2>
                    <p className="text-zinc-500 text-sm">Blog yazılarını ekle, düzenle veya sil. Toplam {postCount} yazı var.</p>
                </Link>

                <Link href="/admin/links" className="p-6 rounded-2xl border border-zinc-800 bg-[#0e0e0e] hover:bg-zinc-800/50 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <LinkIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-200 mb-2">Hızlı Linkler</h2>
                    <p className="text-zinc-500 text-sm">Ana sayfadaki sosyal medya ve diğer linkleri yönet. Toplam {linkCount} link var.</p>
                </Link>

                <Link href="/admin/settings" className="p-6 rounded-2xl border border-zinc-800 bg-[#0e0e0e] hover:bg-zinc-800/50 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Settings className="w-6 h-6 text-purple-500" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-200 mb-2">Genel Ayarlar</h2>
                    <p className="text-zinc-500 text-sm">Hakkımda kısmını, profil fotoğrafını ve tema renklerini değiştir.</p>
                </Link>
            </div>
        </div>
    );
}
