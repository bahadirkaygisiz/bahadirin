"use client";

import { useTransition } from "react";
import { saveSettings } from "../actions";
import toast from "react-hot-toast";

type Settings = {
    aboutMe: string;
    aboutImage: string;
    heroTitle: string;
    heroQuote: string;
    heroDescription: string;
    heroTitleSize: string;
    heroTitleFont: string;
    heroQuoteSize: string;
    heroQuoteFont: string;
    heroDescSize: string;
    heroDescFont: string;
};

const FONT_OPTIONS = [
    { label: "Mono (Kod)", value: "font-mono" },
    { label: "Serif (Klasik)", value: "font-serif" },
    { label: "Sans (Modern)", value: "font-sans" },
    { label: "Siyah Kalın", value: "font-black" },
    { label: "Bold Italic Serif", value: "font-serif font-bold italic" },
    { label: "Bold Italic Sans", value: "font-sans font-bold italic" },
    { label: "Light Tracked", value: "font-light tracking-[0.4em]" },
];

const TITLE_SIZE_OPTIONS = [
    { label: "Çok Küçük", value: "text-sm md:text-base" },
    { label: "Küçük", value: "text-base md:text-lg" },
    { label: "Orta", value: "text-lg md:text-xl" },
    { label: "Büyük", value: "text-xl md:text-2xl" },
    { label: "Çok Büyük (Varsayılan)", value: "text-xl md:text-3xl" },
    { label: "Dev", value: "text-2xl md:text-4xl" },
];

const QUOTE_SIZE_OPTIONS = [
    { label: "Küçük", value: "text-4xl md:text-5xl" },
    { label: "Orta", value: "text-5xl md:text-7xl" },
    { label: "Büyük", value: "text-5xl md:text-[80px] lg:text-[100px]" },
    { label: "Çok Büyük", value: "text-6xl md:text-[100px] lg:text-[120px]" },
    { label: "Dev (Varsayılan)", value: "text-6xl md:text-[110px] lg:text-[140px]" },
    { label: "Ekran Doldur", value: "text-[clamp(3rem,12vw,180px)]" },
];

const DESC_SIZE_OPTIONS = [
    { label: "Küçük", value: "text-base md:text-lg" },
    { label: "Orta (Varsayılan)", value: "text-lg md:text-xl lg:text-2xl" },
    { label: "Büyük", value: "text-xl md:text-2xl lg:text-3xl" },
    { label: "Çok Büyük", value: "text-2xl md:text-3xl lg:text-4xl" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="block text-xs text-zinc-500 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}

function Select({ name, value, options }: { name: string; value: string; options: { label: string; value: string }[] }) {
    return (
        <select
            name={name}
            defaultValue={value}
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all text-sm"
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

export default function AdminSettingsClient({ settings }: { settings: Settings }) {
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const toastId = toast.loading("Ayarlar kaydediliyor...");
            try {
                await saveSettings(formData);
                toast.success("Ayarlar başarıyla kaydedildi!", { id: toastId });
            } catch {
                toast.error("Bir hata oluştu", { id: toastId });
            }
        });
    }

    return (
        <div className="max-w-4xl mx-auto py-4">
            <div className="mb-12">
                <h1 className="text-4xl font-bold font-serif text-white tracking-tight italic">Site Ayarları</h1>
                <p className="text-zinc-500 text-sm mt-2 font-medium">Ana sayfa görünümünü, metinleri ve stil tercihlerini buradan yapılandırın.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12 bg-[#0e0e0e] p-8 md:p-12 rounded-[40px] border border-zinc-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent group-hover:via-amber-500/50 transition-all duration-1000" />

                {/* ── Giriş (Hero) Bölümü ── */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold font-serif italic text-white text-nowrap">Giriş (Hero) Bölümü</h2>
                        <div className="h-px w-full bg-zinc-800" />
                    </div>

                    {/* İsim */}
                    <div className="space-y-4 p-5 rounded-2xl border border-zinc-900 bg-black/30">
                        <p className="text-amber-500 text-xs font-mono uppercase tracking-widest">① İsim (En Üst — İnce Yazı)</p>
                        <Row label="İsim Metni">
                            <input
                                name="heroTitle"
                                type="text"
                                defaultValue={settings.heroTitle}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all font-mono"
                                placeholder="BAHADIR KAYGISIZ"
                            />
                        </Row>
                        <div className="grid grid-cols-2 gap-4">
                            <Row label="Yazı Boyutu">
                                <Select name="heroTitleSize" value={settings.heroTitleSize} options={TITLE_SIZE_OPTIONS} />
                            </Row>
                            <Row label="Yazı Tipi">
                                <Select name="heroTitleFont" value={settings.heroTitleFont} options={FONT_OPTIONS} />
                            </Row>
                        </div>
                    </div>

                    {/* Ana Slogan */}
                    <div className="space-y-4 p-5 rounded-2xl border border-zinc-900 bg-black/30">
                        <p className="text-amber-500 text-xs font-mono uppercase tracking-widest">② Ana Slogan (Orta — Dev Yazı)</p>
                        <Row label="Slogan Metni">
                            <textarea
                                name="heroQuote"
                                rows={2}
                                defaultValue={settings.heroQuote}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all font-serif text-2xl font-bold italic"
                                placeholder="Her gün daha iyiye"
                            />
                        </Row>
                        <div className="grid grid-cols-2 gap-4">
                            <Row label="Yazı Boyutu">
                                <Select name="heroQuoteSize" value={settings.heroQuoteSize} options={QUOTE_SIZE_OPTIONS} />
                            </Row>
                            <Row label="Yazı Tipi & Stil">
                                <Select name="heroQuoteFont" value={settings.heroQuoteFont} options={FONT_OPTIONS} />
                            </Row>
                        </div>
                    </div>

                    {/* Açıklama */}
                    <div className="space-y-4 p-5 rounded-2xl border border-zinc-900 bg-black/30">
                        <p className="text-amber-500 text-xs font-mono uppercase tracking-widest">③ Açıklama (Alt — Normal Yazı)</p>
                        <Row label="Açıklama Metni">
                            <textarea
                                name="heroDescription"
                                rows={3}
                                defaultValue={settings.heroDescription}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all text-zinc-400"
                                placeholder="Kişisel gelişim, psikoloji, felsefe..."
                            />
                        </Row>
                        <div className="grid grid-cols-2 gap-4">
                            <Row label="Yazı Boyutu">
                                <Select name="heroDescSize" value={settings.heroDescSize} options={DESC_SIZE_OPTIONS} />
                            </Row>
                            <Row label="Yazı Tipi & Stil">
                                <Select name="heroDescFont" value={settings.heroDescFont} options={FONT_OPTIONS} />
                            </Row>
                        </div>
                    </div>
                </div>

                {/* ── Hakkımda Bölümü ── */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold font-serif italic text-white text-nowrap">Hakkımda Bölümü</h2>
                        <div className="h-px w-full bg-zinc-800" />
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <Row label="Hakkımda Fotoğraf URL">
                            <input
                                name="aboutImage"
                                type="text"
                                defaultValue={settings.aboutImage}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all font-mono text-sm"
                                placeholder="/avatar.jpg"
                            />
                        </Row>
                        <Row label="Hakkımda Detay Metni">
                            <textarea
                                name="aboutMe"
                                required
                                rows={6}
                                defaultValue={settings.aboutMe}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all leading-relaxed"
                                placeholder="Kendinizi tanıtın..."
                            />
                        </Row>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-900 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-12 py-4 bg-zinc-100 text-black font-black rounded-full hover:bg-white active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
                    >
                        {isPending ? "KAYDEDİLİYOR..." : "AYARLARI GÜNCELLE"}
                    </button>
                </div>
            </form>
        </div>
    );
}
