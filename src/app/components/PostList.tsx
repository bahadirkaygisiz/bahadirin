"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import ScrollReveal from "./ScrollReveal";
import { ArrowRight } from "lucide-react";

interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
}

export default function PostList({ posts }: { posts: Post[] }) {
    const [visibleCount, setVisibleCount] = useState(4);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 4);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.slice(0, visibleCount).map((post, idx) => (
                <ScrollReveal key={post.id} delay={idx * 50}>
                    <Link
                        href={`/blog/${post.slug}`}
                        className="group block relative h-full bg-zinc-950 border border-zinc-900 rounded-[32px] overflow-hidden hover:border-zinc-700 transition-all duration-300"
                    >
                        {/* Image Box */}
                        <div className="aspect-[16/9] overflow-hidden bg-zinc-900">
                            {post.coverImage ? (
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                    <h4 className="text-4xl font-serif italic">{post.title.charAt(0)}</h4>
                                </div>
                            )}
                        </div>

                        {/* Content Box */}
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest px-2 py-1 bg-amber-500/5 rounded">DÜŞÜNCE</span>
                                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                                    {format(new Date(post.createdAt), "dd MMMM yyyy", { locale: tr })}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold font-serif mb-4 text-zinc-100 group-hover:text-amber-500 transition-colors leading-tight italic">
                                {post.title}
                            </h3>

                            <p className="text-zinc-500 text-sm line-clamp-3 leading-relaxed mb-8">
                                {post.excerpt || post.content.replace(/<[^>]*>?/gm, "").substring(0, 160) + "..."}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-900">
                                <span className="text-xs text-zinc-600 italic">Bahadır Kaygısız</span>
                                <div className="flex items-center gap-2 text-zinc-200 group-hover:translate-x-1 transition-transform">
                                    <span className="text-[11px] font-bold uppercase tracking-wider">OKU</span>
                                    <ArrowRight size={14} className="text-amber-500" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </ScrollReveal>
            ))}

            {visibleCount < posts.length && (
                <div className="md:col-span-2 pt-12 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        className="group px-12 py-4 rounded-full border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:bg-zinc-100 hover:text-black transition-all active:scale-95 flex items-center gap-4"
                    >
                        <span>Daha Fazla Paylaşım</span>
                        <div className="w-1 h-1 bg-amber-500 rounded-full group-hover:w-4 transition-all" />
                    </button>
                </div>
            )}
        </div>
    );
}
