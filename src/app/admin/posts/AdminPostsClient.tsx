"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Plus, ArrowRight, ExternalLink } from "lucide-react";
import { deletePost, updatePostsOrder, createDraft } from "../actions";
import Link from 'next/link';
import { useRouter } from "next/navigation";

type PostData = {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    order: number;
    createdAt: Date;
    coverImage: string | null;
};

function SortablePostItem({
    post,
    onDelete,
}: {
    post: PostData;
    onDelete: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: post.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.75 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${isDragging
                ? "border-amber-500 shadow-2xl bg-zinc-900"
                : "border-zinc-800 bg-[#0e0e0e] hover:border-zinc-700 hover:bg-zinc-900/50"
                }`}
        >
            <div className="flex items-center gap-4 min-w-0">
                <button
                    {...attributes}
                    {...listeners}
                    className="text-zinc-700 hover:text-zinc-400 cursor-grab active:cursor-grabbing p-1 shrink-0 transition-colors"
                >
                    <GripVertical size={18} />
                </button>

                {post.coverImage && (
                    <img src={post.coverImage} className="w-12 h-12 object-cover rounded-xl border border-zinc-800" alt="" />
                )}

                <div className="min-w-0">
                    <h3 className="font-bold text-zinc-200 truncate group-hover:text-amber-500 transition-colors">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-widest ${post.published ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                            {post.published ? 'YAYINDA' : 'TASLAK'}
                        </span>
                        <p className="text-[10px] text-zinc-600 font-mono italic truncate">/{post.slug}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
                <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-2.5 rounded-xl text-zinc-600 hover:text-blue-400 hover:bg-zinc-800/80 transition-all"
                    title="Dışarıda Gör"
                >
                    <ExternalLink size={18} />
                </Link>
                <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="p-2.5 rounded-xl text-zinc-600 hover:text-amber-400 hover:bg-zinc-800/80 transition-all"
                    title="Düzenle"
                >
                    <Pencil size={18} />
                </Link>
                <button
                    onClick={() => onDelete(post.id)}
                    className="p-2.5 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-zinc-800/80 transition-all"
                    title="Sil"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}

export default function AdminPostsClient({ initialPosts }: { initialPosts: PostData[] }) {
    const [posts, setPosts] = useState(initialPosts);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = posts.findIndex((p) => p.id === active.id);
        const newIndex = posts.findIndex((p) => p.id === over.id);
        const newArray = arrayMove(posts, oldIndex, newIndex).map((p, i) => ({ ...p, order: i }));

        setPosts(newArray);
        await updatePostsOrder(newArray.map((p) => p.id));
        toast.success("Sıralama güncellendi");
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu makaleyi silmek istediğinize emin misiniz?")) return;
        await deletePost(id);
        toast.success("Makale başarıyla silindi");
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    async function handleNewPost() {
        const toastId = toast.loading("Yeni taslak oluşturuluyor...");
        try {
            const id = await createDraft();
            router.push(`/admin/posts/${id}/edit`);
            toast.success("Taslak oluşturuldu", { id: toastId });
        } catch (err) {
            toast.error("Taslak oluşturulamadı", { id: toastId });
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold font-serif text-white tracking-tight">Tüm Makaleler</h1>
                    <p className="text-zinc-500 text-sm mt-2 font-medium">İçeriklerini yönet ve ana sayfadaki sırasını belirle.</p>
                </div>
                <button
                    onClick={handleNewPost}
                    className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-black font-extrabold rounded-2xl hover:bg-amber-400 transition-all active:scale-95 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.3)] group"
                >
                    <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                    Yeni Makale
                </button>
            </div>

            {posts.length === 0 ? (
                <div className="p-20 text-center bg-[#0e0e0e] border border-zinc-800 border-dashed rounded-[32px] group hover:border-amber-500/30 transition-colors">
                    <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform">
                        <Plus className="text-zinc-500" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-300">Henüz bir şey yok...</h3>
                    <p className="text-zinc-500 mt-2 mb-8 max-w-sm mx-auto font-medium">Büyülü kelimelerini dünyayla paylaşmak için ilk adımını at.</p>
                    <Link href="/admin/posts/new" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-amber-500 font-bold rounded-xl hover:bg-zinc-700 transition-all">
                        Şimdi Yazmaya Başla <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {mounted ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-3">
                                    {posts.map((post) => (
                                        <SortablePostItem
                                            key={post.id}
                                            post={post}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 rounded-3xl border border-zinc-900 bg-zinc-950/50 animate-pulse h-24" />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
