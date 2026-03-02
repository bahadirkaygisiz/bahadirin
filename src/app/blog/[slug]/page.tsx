import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ArrowLeft, User, Calendar, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { prisma } from "../../../lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await prisma.post.findUnique({ where: { slug } });
    if (!post) return { title: "Yazı Bulunamadı" };

    return {
        title: `${post.title} | Bahadır Kaygısız`,
        description: post.metaDescription || post.excerpt || post.content.substring(0, 160) + "...",
        keywords: post.tags || "psikoloji, felsefe, kişisel gelişim",
        openGraph: {
            images: post.coverImage ? [post.coverImage] : []
        }
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await prisma.post.findUnique({ where: { slug } });

    if (!post || !post.published) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-amber-500/30">
            <article className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-all mb-12 group"
                >
                    <div className="p-2 border border-zinc-900 rounded-lg group-hover:border-zinc-700">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="text-sm font-medium tracking-tight">Ana Sayfaya Dön</span>
                </Link>

                {/* Cover Image */}
                {post.coverImage && (
                    <div className="w-full aspect-[21/9] rounded-[40px] overflow-hidden mb-16 border border-zinc-900">
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <header className="mb-16">
                    <div className="flex flex-wrap items-center gap-6 text-zinc-600 mb-8 border-b border-zinc-900 pb-8 uppercase tracking-[0.2em] text-[10px] font-mono">
                        <div className="flex items-center gap-2">
                            <User size={12} className="text-amber-500" />
                            <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-amber-500" />
                            <span>{format(post.createdAt, "dd MMMM yyyy", { locale: tr })}</span>
                        </div>
                        {post.tags && (
                            <div className="flex items-center gap-2">
                                <Tag size={12} className="text-amber-500" />
                                <span>{post.tags.split(',')[0]}</span>
                            </div>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black font-serif text-white tracking-tighter leading-[1.1] md:leading-[1] italic">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="mt-8 text-xl md:text-2xl text-zinc-400 font-serif leading-relaxed italic border-l-2 border-amber-500/30 pl-8">
                            {post.excerpt}
                        </p>
                    )}
                </header>

                <section className="prose prose-invert prose-zinc max-w-none 
          prose-headings:font-serif prose-headings:italic prose-headings:tracking-tight
          prose-h2:text-3xl prose-h2:border-b prose-h2:border-zinc-900 prose-h2:pb-4
          prose-p:text-zinc-400 prose-p:leading-loose prose-p:text-lg
          prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-[32px] prose-img:border prose-img:border-zinc-900
          prose-code:text-amber-200 prose-blockquote:border-amber-500/40 prose-blockquote:bg-zinc-950 prose-blockquote:px-8 prose-blockquote:py-2 prose-blockquote:rounded-2xl
        ">
                    <ReactMarkdown>
                        {post.content}
                    </ReactMarkdown>
                </section>

                <footer className="mt-32 p-12 bg-zinc-950 border border-zinc-900 rounded-[40px] text-center">
                    <p className="text-zinc-500 text-sm mb-6 font-serif italic">Bu yazıyla ilgili düşüncelerini paylaşmak ister misin?</p>
                    <div className="flex justify-center gap-4">
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://bahadirin.com/blog/${post.slug}`)}`}
                            target="_blank"
                            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors"
                        >
                            X'de Paylaş
                        </a>
                        <a
                            href="mailto:bahadirkaygisiz1@gmail.com"
                            className="px-8 py-3 border border-zinc-800 text-zinc-300 font-bold rounded-full hover:bg-zinc-900 transition-colors"
                        >
                            E-posta Gönder
                        </a>
                    </div>
                </footer>
            </article>
        </main>
    );
}
