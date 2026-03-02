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
import { GripVertical, Pencil, Trash2, Check, X } from "lucide-react";
import { saveLink, deleteLink, updateLinksOrder } from "../actions";

type LinkData = {
    id: string;
    title: string;
    url: string;
    icon: string | null;
    order: number;
};

// Empty form state
const EMPTY_FORM = { title: "", url: "", icon: "", order: "" };

function SortableLinkItem({
    link,
    isEditing,
    onEdit,
    onDelete,
}: {
    link: LinkData;
    isEditing: boolean;
    onEdit: (l: LinkData) => void;
    onDelete: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: link.id });

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
                <div className="min-w-0">
                    <p className="font-semibold text-zinc-200 truncate">{link.title}</p>
                    <p className="text-xs text-zinc-600 truncate max-w-[180px]">{link.url}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
                <span className="px-2 py-1 bg-zinc-800/80 rounded text-[11px] text-zinc-500 mr-1">
                    #{link.order}
                </span>
                <button
                    onClick={() => onEdit(link)}
                    title="Düzenle"
                    className="p-2 rounded-lg text-zinc-600 hover:text-amber-400 hover:bg-zinc-800 transition-all duration-150"
                >
                    <Pencil size={15} />
                </button>
                <button
                    onClick={() => {
                        if (confirm("Bu linki silmek istediğinize emin misiniz?")) onDelete(link.id);
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

export default function AdminLinksClient({ initialLinks }: { initialLinks: LinkData[] }) {
    const [links, setLinks] = useState(initialLinks);
    const [editingId, setEditingId] = useState<string | null>(null);
    // Controlled form state — always correct values
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    function startEdit(link: LinkData) {
        setEditingId(link.id);
        setForm({
            title: link.title,
            url: link.url,
            icon: link.icon ?? "",
            order: String(link.order),
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(EMPTY_FORM);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = links.findIndex((l) => l.id === active.id);
        const newIndex = links.findIndex((l) => l.id === over.id);
        const newArray = arrayMove(links, oldIndex, newIndex).map((l, i) => ({ ...l, order: i }));

        setLinks(newArray);
        await updateLinksOrder(newArray.map((l) => l.id));
        toast.success("Sıralama güncellendi");
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);

        const fd = new FormData();
        if (editingId) fd.set("id", editingId);
        fd.set("title", form.title);
        fd.set("url", form.url);
        fd.set("icon", form.icon);
        fd.set("order", form.order);

        await saveLink(fd);
        toast.success("Bağlantı başarıyla kaydedildi");

        // Update local list immediately — no page reload needed
        if (editingId) {
            setLinks((prev) =>
                prev.map((l) =>
                    l.id === editingId
                        ? { ...l, title: form.title, url: form.url, icon: form.icon, order: parseInt(form.order) }
                        : l
                )
            );
        } else {
            // New link — we don't know the ID yet, so reload happens via revalidatePath
            // We refresh the page state by navigating softly
            window.location.reload();
        }

        cancelEdit();
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Emin misiniz?")) return;
        await deleteLink(id);
        toast.success("Bağlantı başarıyla silindi");
        setLinks((prev) => prev.filter((l) => l.id !== id));
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── Form ── */}
            <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    {editingId ? (
                        <>
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                            Linki Düzenle
                        </>
                    ) : (
                        "Yeni Link Ekle"
                    )}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4 bg-[#0e0e0e] p-6 rounded-2xl border border-zinc-800">
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-widest">Başlık</label>
                        <input
                            required
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                            placeholder="Örn: X (Twitter)"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-widest">URL</label>
                        <input
                            required
                            value={form.url}
                            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                            placeholder="https://x.com/... veya mailto:..."
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-widest">İkon</label>
                            <input
                                value={form.icon}
                                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                                placeholder="twitter, instagram, youtube…"
                            />
                        </div>
                        <div className="w-24">
                            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-widest">Sıra</label>
                            <input
                                type="number"
                                value={form.order}
                                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                                placeholder={String(links.length)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 text-black font-bold rounded-lg py-3 hover:bg-white active:bg-zinc-200 transition-colors disabled:opacity-50"
                        >
                            <Check size={16} />
                            {saving ? "Kaydediliyor…" : editingId ? "Güncelle" : "Ekle"}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex items-center gap-2 px-5 bg-zinc-900 border border-zinc-700 text-zinc-400 font-semibold rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                            >
                                <X size={15} />
                                İptal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* ── List ── */}
            <div>
                <h2 className="text-lg font-bold mb-4">
                    Mevcut Linkler{" "}
                    <span className="text-zinc-600 font-normal text-sm ml-1">— sürükle &amp; bırak</span>
                </h2>
                {mounted ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {links.map((link) => (
                                    <SortableLinkItem
                                        key={link.id}
                                        link={link}
                                        isEditing={link.id === editingId}
                                        onEdit={startEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="space-y-2">
                        {links.map((link) => (
                            <div key={link.id} className="p-4 rounded-xl border border-zinc-800 bg-[#0e0e0e] opacity-50">
                                {link.title}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
