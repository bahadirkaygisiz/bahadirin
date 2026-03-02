"use client";

import { useState, useRef, useMemo, useEffect } from "react";
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
import { GripVertical, Pencil, Trash2, Check, X, Upload, Image as ImageIcon } from "lucide-react";
import { savePost, deletePost, updatePostsOrder } from "../actions";
import dynamic from 'next/dynamic';
import "easymde/dist/easymde.min.css";

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

type PostData = {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    metaDescription: string | null;
    tags: string | null;
    published: boolean;
    order: number;
};

const EMPTY_POST = {
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: "",
    metaDescription: "",
    tags: "",
    published: true,
    order: 0
};

function SortablePostItem({
    post,
    isEditing,
    onEdit,
    onDelete,
}: {
    post: PostData;
    isEditing: boolean;
    onEdit: (p: PostData) => void;
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
            className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${isEditing
                ? "border-amber-500/60 bg-zinc-900/80"
                : isDragging
                    ? "border-amber-500 shadow-xl bg-zinc-900"
                    : "border-zinc-800 bg-[#0e0e0e] hover:border-zinc-700"
                }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <button
                    {...attributes}
                    {...listeners}
                    className="text-zinc-700 hover:text-zinc-400 cursor-grab active:cursor-grabbing p-1 shrink-0 transition-colors"
                >
                    <GripVertical size={18} />
                </button>
                {post.coverImage && (
                    <img src={post.coverImage} className="w-10 h-10 object-cover rounded-lg border border-zinc-800" alt="" />
                )}
                <div className="min-w-0">
                    <p className="font-semibold text-zinc-200 truncate">{post.title}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] text-zinc-600 font-mono">/{post.slug}</p>
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${post.published ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                            {post.published ? 'YAYINDA' : 'TASLAK'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                    onClick={() => onEdit(post)}
                    title="Düzenle"
                    className="p-2 rounded-lg text-zinc-600 hover:text-amber-400 hover:bg-zinc-800 transition-all duration-150"
                >
                    <Pencil size={15} />
                </button>
                <button
                    onClick={() => {
                        if (confirm("Bu makaleyi silmek istediğinize emin misiniz?")) onDelete(post.id);
                    }}
                    title="Sil"
                    className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-all duration-150"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
}

export default function AdminPostsClient({ initialPosts }: { initialPosts: PostData[] }) {
    const [posts, setPosts] = useState(initialPosts);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_POST);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const mdeOptions = useMemo(() => ({
        spellChecker: false,
        placeholder: "İçeriği buralara dökün...",
        status: false,
        minHeight: "300px",
        toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen"] as any
    }), []);

    function startEdit(post: PostData) {
        setEditingId(post.id);
        setForm({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt ?? "",
            coverImage: post.coverImage ?? "",
            metaDescription: post.metaDescription ?? "",
            tags: post.tags ?? "",
            published: post.published,
            order: post.order
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(EMPTY_POST);
    }

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

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading("Görsel yükleniyor...");
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                setForm(f => ({ ...f, coverImage: data.url }));
                toast.success("Görsel başarıyla yüklendi", { id: toastId });
            } else {
                toast.error("Görsel yüklenemedi", { id: toastId });
            }
        } catch (err) {
            toast.error("Yükleme başarısız oldu.", { id: toastId });
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const fd = new FormData();
        if (editingId) fd.set("id", editingId);
        fd.set("title", form.title);
        fd.set("slug", form.slug);
        fd.set("content", form.content);
        fd.set("excerpt", form.excerpt);
        fd.set("coverImage", form.coverImage);
        fd.set("metaDescription", form.metaDescription);
        fd.set("tags", form.tags);
        if (form.published) fd.set("published", "on");
        fd.set("order", String(form.order));

        await savePost(fd);
        toast.success(editingId ? "Makale güncellendi" : "Yeni makale oluşturuldu");

        // Refresh the list from the server naturally
        window.location.reload();
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu makaleyi silmek istediğinize emin misiniz?")) return;
        await deletePost(id);
        toast.success("Makale başarıyla silindi");
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    return (
        <div className="flex flex-col lg:flex-row gap-10">
            {/* ── Editor Section ── */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold font-serif">
                        {editingId ? "Makaleyi Düzenle" : "Yeni Makale Yaz"}
                    </h2>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">Vazgeç</button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-[#0e0e0e] p-6 rounded-2xl border border-zinc-800 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">Başlık</label>
                            <input
                                required
                                value={form.title}
                                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all font-serif text-lg"
                                placeholder="Etkileyici bir başlık..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">Slug (URL)</label>
                            <input
                                required
                                value={form.slug}
                                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all font-mono text-sm"
                                placeholder="zaman-yonetimi-rehberi"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">Kapak Fotoğrafı</label>
                            <div className="flex gap-4">
                                <div className="relative group w-20 h-20 bg-black border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                    {form.coverImage ? (
                                        <img src={form.coverImage} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <ImageIcon className="text-zinc-700" size={24} />
                                    )}
                                    {uploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-[10px]">...</div>}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        value={form.coverImage}
                                        onChange={(e) => setForm(f => ({ ...f, coverImage: e.target.value }))}
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-zinc-400 focus:outline-none"
                                        placeholder="URL veya yükleyin..."
                                    />
                                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg cursor-pointer transition-colors">
                                        <Upload size={12} />
                                        Dosya Seç
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">Özet (Excerpt)</label>
                            <textarea
                                value={form.excerpt}
                                onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
                                rows={3}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-zinc-300 text-sm focus:outline-none focus:border-amber-500"
                                placeholder="Ana sayfada görülecek kısa metin..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">İçerik (Markdown & Rich Text)</label>
                        <div className="prose-edit">
                            <SimpleMDE
                                value={form.content}
                                onChange={(val) => setForm(f => ({ ...f, content: val }))}
                                options={mdeOptions}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-800/50 pt-6">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">SEO: Meta Description</label>
                            <input
                                value={form.metaDescription}
                                onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-zinc-400 text-sm"
                                placeholder="Arama motoru açıklaması..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">SEO: Etiketler (Virgülle ayır)</label>
                            <input
                                value={form.tags}
                                onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-zinc-400 text-sm"
                                placeholder="psikoloji, verimlilik, felsefe..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-800">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="published"
                                checked={form.published}
                                onChange={(e) => setForm(f => ({ ...f, published: e.target.checked }))}
                                className="w-5 h-5 accent-amber-500 rounded border-zinc-800 bg-zinc-900"
                            />
                            <label htmlFor="published" className="text-zinc-300 text-sm font-medium">Yayına Al</label>
                        </div>
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="px-10 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Yayınla"}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── List Section ── */}
            <div className="w-full lg:w-80 shrink-0">
                <h2 className="text-lg font-bold mb-6">Mevcut Makaleler</h2>
                {mounted ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                                {posts.map((post) => (
                                    <SortablePostItem
                                        key={post.id}
                                        post={post}
                                        isEditing={post.id === editingId}
                                        onEdit={startEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="space-y-3">
                        {posts.map((post) => (
                            <div key={post.id} className="p-4 rounded-xl border border-zinc-800 bg-[#0e0e0e] opacity-50">
                                {post.title}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
