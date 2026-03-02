"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    Check, X, Upload, Image as ImageIcon, ArrowLeft, Eye, Save,
    Globe, Settings, BarChart, PanelRightClose, PanelRightOpen,
    Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Link as LinkIcon
} from "lucide-react";
import { savePost } from "../actions";
import Link from 'next/link';
import { slugify } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Tiptap Imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';

type PostData = {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    coverImage?: string | null;
    metaDescription?: string | null;
    tags?: string | null;
    published: boolean;
};

const MenuButton = ({ onClick, active, children, title }: { onClick: () => void, active?: boolean, children: React.ReactNode, title?: string }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={`p-2 rounded-lg transition-all ${active ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
    >
        {children}
    </button>
);

export default function AdminPostEditor({ initialData }: { initialData?: PostData }) {
    const [form, setForm] = useState<PostData>(initialData || {
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        coverImage: "",
        metaDescription: "",
        tags: "",
        published: false,
    });

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [autoSlug, setAutoSlug] = useState(() => {
        return !initialData?.id || (form.slug.startsWith("taslak-") && !form.published);
    });

    // Tiptap Editor Setup
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-2xl border border-zinc-800 my-8 shadow-2xl',
                },
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-amber-500 underline',
                },
            }),
            Placeholder.configure({
                placeholder: 'Büyülü kelimelerinizi buraya dökün...',
            }),
            Markdown,
        ],
        content: initialData?.content || "",
        onUpdate: ({ editor }) => {
            setForm(f => ({ ...f, content: (editor.storage as any).markdown.getMarkdown() }));
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] py-8',
            },
            handlePaste: (view, event) => {
                const items = Array.from(event.clipboardData?.items || []);
                for (const item of items) {
                    if (item.type.indexOf("image") !== -1) {
                        const file = item.getAsFile();
                        if (file) {
                            uploadImageToEditor(file);
                            return true;
                        }
                    }
                }
                return false;
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    uploadImageToEditor(event.dataTransfer.files[0]);
                    return true;
                }
                return false;
            },
        },
    });

    const uploadImageToEditor = async (file: File) => {
        const toastId = toast.loading("Görsel işleniyor...");
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url && editor) {
                editor.chain().focus().setImage({ src: data.url }).run();
                toast.success("Görsel eklendi", { id: toastId });
            }
        } catch (err) {
            toast.error("Yükleme hatası", { id: toastId });
        }
    };

    // Auto-slug generation
    useEffect(() => {
        if (autoSlug && form.title && form.title !== "Adsız Taslak") {
            setForm(f => ({ ...f, slug: slugify(f.title) }));
        }
    }, [form.title, autoSlug]);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading("Kapak fotoğrafı yükleniyor...");
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                setForm(f => ({ ...f, coverImage: data.url }));
                toast.success("Kapak fotoğrafı güncellendi", { id: toastId });
            }
        } catch (err) {
            toast.error("Yükleme başarısız.", { id: toastId });
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(publish: boolean = false) {
        setSaving(true);
        const toastId = toast.loading(publish ? "Yayınlanıyor..." : "Taslak kaydediliyor...");

        const fd = new FormData();
        if (form.id) fd.set("id", form.id);
        fd.set("title", form.title);
        fd.set("slug", form.slug);
        fd.set("content", form.content);
        fd.set("excerpt", form.excerpt || "");
        fd.set("coverImage", form.coverImage || "");
        fd.set("metaDescription", form.metaDescription || "");
        fd.set("tags", form.tags || "");
        if (publish || form.published) fd.set("published", "on");

        try {
            await savePost(fd);
            toast.success(publish ? "Makale yayınlandı!" : "Taslak kaydedildi.", { id: toastId });
            if (!form.id) {
                window.location.href = "/admin/posts";
            }
        } catch (err) {
            toast.error("Bir hata oluştu.", { id: toastId });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top duration-700">
                <div className="flex items-center gap-6">
                    <Link href="/admin/posts" className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95 group">
                        <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-white tracking-tight">
                            {initialData?.id ? "Makaleyi Düzenle" : "Yeni Makale"}
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1 font-medium">İçeriğini hazırla, optimize et ve dünyayla paylaş.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`p-3 rounded-2xl border transition-all ${isSidebarOpen ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
                        title={isSidebarOpen ? "Paneli Kapat" : "Paneli Aç"}
                    >
                        {isSidebarOpen ? <PanelRightClose size={22} /> : <PanelRightOpen size={22} />}
                    </button>

                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Save size={20} />
                        Taslak Kaydet
                    </button>
                    <button
                        onClick={() => handleSubmit(true)}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-amber-500 text-black font-extrabold hover:bg-amber-400 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.4)] transition-all active:scale-95 disabled:opacity-50 group"
                    >
                        <Globe size={20} className="group-hover:rotate-12 transition-transform" />
                        {form.published ? "Güncelle" : "Yayınla"}
                    </button>
                </div>
            </div>

            <div className="flex gap-8 relative items-start">
                {/* Main Section */}
                <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
                    <motion.div
                        layout
                        className="bg-[#0e0e0e] border border-zinc-800/80 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-3xl"
                    >
                        {/* Internal Tabs */}
                        <div className="flex border-b border-zinc-800/40 p-2 bg-black/40">
                            <button
                                onClick={() => setActiveTab('content')}
                                className={`flex items-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-2xl ${activeTab === 'content' ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <Eye size={16} /> İçerik
                            </button>
                            <button
                                onClick={() => setActiveTab('seo')}
                                className={`flex items-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-2xl ${activeTab === 'seo' ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <BarChart size={16} /> SEO & Meta
                            </button>
                        </div>

                        <div className="p-8 md:p-12">
                            {activeTab === 'content' && (
                                <div className="space-y-10">
                                    {/* Title & Slug */}
                                    <div className="space-y-6">
                                        <textarea
                                            required
                                            rows={1}
                                            value={form.title}
                                            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                            className="w-full bg-transparent border-none text-5xl md:text-6xl font-bold font-serif text-white placeholder:text-zinc-900 focus:ring-0 p-0 resize-none h-auto"
                                            placeholder="Göz alıcı bir başlık..."
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = `${target.scrollHeight}px`;
                                            }}
                                        />
                                        <div className="flex items-center gap-3 text-zinc-600 font-mono text-xs bg-black/60 w-fit px-4 py-2.5 rounded-2xl border border-zinc-800/50 group">
                                            <span className="opacity-30 uppercase tracking-widest text-[9px] font-bold">Permalink:</span>
                                            <span className="opacity-60">bahadirin.com/blog/</span>
                                            <input
                                                value={form.slug}
                                                onChange={(e) => {
                                                    setAutoSlug(false);
                                                    setForm(f => ({ ...f, slug: e.target.value }));
                                                }}
                                                className="bg-transparent border-none p-0 text-amber-500/90 focus:ring-0 min-w-[120px] font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* WYSIWYG Editor */}
                                    <div className="space-y-4">
                                        {/* Toolbar */}
                                        <div className="sticky top-4 z-30 flex flex-wrap items-center gap-1.5 p-2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl w-fit">
                                            <MenuButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Kalın">
                                                <Bold size={18} />
                                            </MenuButton>
                                            <MenuButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="İtalik">
                                                <Italic size={18} />
                                            </MenuButton>
                                            <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
                                            <MenuButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })} title="Başlık 1">
                                                <Heading1 size={18} />
                                            </MenuButton>
                                            <MenuButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Başlık 2">
                                                <Heading2 size={18} />
                                            </MenuButton>
                                            <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
                                            <MenuButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Listeleme">
                                                <List size={18} />
                                            </MenuButton>
                                            <MenuButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Sıralı Liste">
                                                <ListOrdered size={18} />
                                            </MenuButton>
                                            <MenuButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Alıntı">
                                                <Quote size={18} />
                                            </MenuButton>
                                            <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
                                            <MenuButton onClick={() => {
                                                const url = window.prompt('URL Girin:');
                                                if (url) editor?.chain().focus().setLink({ href: url }).run();
                                            }} active={editor?.isActive('link')} title="Bağlantı">
                                                <LinkIcon size={18} />
                                            </MenuButton>
                                            <MenuButton onClick={() => editor?.chain().focus().setImage({ src: '' }).run()} title="Görsel (Paste önerilir)">
                                                <ImageIcon size={18} />
                                            </MenuButton>
                                        </div>

                                        <div className="editor-content-wrapper min-h-[600px]">
                                            <EditorContent editor={editor} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'seo' && (
                                <div className="space-y-12 py-6 animate-in fade-in duration-500">
                                    <div className="space-y-4">
                                        <label className="block text-xs font-extra-bold text-zinc-500 uppercase tracking-[0.25em]">Meta Açıklama</label>
                                        <textarea
                                            value={form.metaDescription || ""}
                                            onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                                            rows={4}
                                            className="w-full bg-black border border-zinc-800/60 rounded-[32px] p-6 text-zinc-300 focus:border-amber-500/40 transition-all outline-none text-sm leading-relaxed"
                                            placeholder="Google sonuçlarında görünecek sihirli özetiniz..."
                                        />
                                        <div className="flex justify-between items-center px-4">
                                            <span className="text-[10px] text-zinc-600 font-bold">Önerilen: 155-160 karakter</span>
                                            <span className={`text-[10px] font-bold ${form.metaDescription?.length && form.metaDescription.length > 160 ? 'text-red-500' : 'text-zinc-600'}`}>
                                                {form.metaDescription?.length || 0} / 160
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-xs font-extra-bold text-zinc-500 uppercase tracking-[0.25em]">Etiketler</label>
                                        <input
                                            value={form.tags || ""}
                                            onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                                            className="w-full bg-black border border-zinc-800/60 rounded-2xl p-5 text-zinc-300 focus:border-amber-500/40 transition-all outline-none text-sm"
                                            placeholder="strateji, felsefe, inovasyon..."
                                        />
                                    </div>

                                    {/* Google Preview */}
                                    <div className="p-10 bg-zinc-950 rounded-[40px] border border-zinc-900/80 shadow-inner group">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-black">Google Canlı Önizleme</span>
                                        </div>
                                        <h4 className="text-blue-400 text-2xl hover:underline cursor-pointer truncate mb-1">
                                            {form.title || 'Harika Bir Başlık'}
                                        </h4>
                                        <div className="flex items-center gap-1 mb-3">
                                            <span className="text-zinc-500 text-[13px]">bahadirin.com › blog › </span>
                                            <span className="text-zinc-400 text-[13px] font-medium">{form.slug || 'slug'}</span>
                                        </div>
                                        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                                            {form.metaDescription || 'Henüz bir açıklama girilmedi. İyi bir meta açıklama tıklanma oranını artırır...'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Collapsible Sidebar */}
                <AnimatePresence initial={false}>
                    {isSidebarOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                            animate={{ width: 340, opacity: 1, marginLeft: 32 }}
                            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="sticky top-8 space-y-8 overflow-hidden shrink-0"
                        >
                            <div className="bg-[#0e0e0e] border border-zinc-800/80 rounded-[40px] p-8 shadow-2xl space-y-10 backdrop-blur-2xl">
                                <h3 className="font-black text-xs text-zinc-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                                        <Settings size={14} className="text-amber-500" />
                                    </div>
                                    Panel Ayarları
                                </h3>

                                <div className="space-y-8">
                                    {/* Cover Image Block */}
                                    <div className="space-y-4">
                                        <label className="block text-[10px] text-zinc-600 uppercase font-black tracking-widest">Kapak Fotoğrafı</label>
                                        <div className="relative group aspect-[4/3] bg-zinc-900/40 rounded-3xl border-2 border-dashed border-zinc-800/50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-amber-500/40 hover:bg-zinc-900/60">
                                            {form.coverImage ? (
                                                <>
                                                    <img src={form.coverImage} className="w-full h-full object-cover" alt="" />
                                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <button
                                                            onClick={() => setForm(f => ({ ...f, coverImage: "" }))}
                                                            className="p-4 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                                        >
                                                            <X size={20} />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-6 space-y-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-700">
                                                        <ImageIcon size={24} />
                                                    </div>
                                                    <p className="text-[10px] text-zinc-600 font-bold">TIKLA VEYA SÜRÜKLE</p>
                                                </div>
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                                                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileUpload} />
                                        </div>
                                    </div>

                                    {/* Excerpt Block */}
                                    <div className="space-y-4">
                                        <label className="block text-[10px] text-zinc-600 uppercase font-black tracking-widest">Özet (Lead)</label>
                                        <textarea
                                            value={form.excerpt || ""}
                                            onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
                                            rows={6}
                                            className="w-full bg-black border border-zinc-800/60 rounded-[24px] p-5 text-zinc-400 text-xs leading-relaxed outline-none focus:border-amber-500/20 transition-all resize-none shadow-inner"
                                            placeholder="Giriş paragrafı etkileyici olsun..."
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-zinc-800/40">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Drum</span>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${form.published ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {form.published ? 'YAYINDA' : 'TASLAK'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
