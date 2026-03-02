import { prisma } from "../../../lib/prisma";
export const dynamic = "force-dynamic";
import AdminSettingsClient from "./AdminSettingsClient";

export default async function SettingsAdminPage() {
    const aboutMeSetting = await prisma.setting.findUnique({ where: { key: 'ABOUT_ME' } });
    const aboutImageSetting = await prisma.setting.findUnique({ where: { key: 'ABOUT_IMAGE_URL' } });
    const heroTitleSetting = await prisma.setting.findUnique({ where: { key: 'HERO_TITLE' } });
    const heroQuoteSetting = await prisma.setting.findUnique({ where: { key: 'HERO_QUOTE' } });
    const heroDescriptionSetting = await prisma.setting.findUnique({ where: { key: 'HERO_DESCRIPTION' } });

    const heroTitleSizeSetting = await prisma.setting.findUnique({ where: { key: 'HERO_TITLE_SIZE' } });
    const heroTitleFontSetting = await prisma.setting.findUnique({ where: { key: 'HERO_TITLE_FONT' } });
    const heroQuoteSizeSetting = await prisma.setting.findUnique({ where: { key: 'HERO_QUOTE_SIZE' } });
    const heroQuoteFontSetting = await prisma.setting.findUnique({ where: { key: 'HERO_QUOTE_FONT' } });
    const heroDescSizeSetting = await prisma.setting.findUnique({ where: { key: 'HERO_DESC_SIZE' } });
    const heroDescFontSetting = await prisma.setting.findUnique({ where: { key: 'HERO_DESC_FONT' } });

    const settings = {
        aboutMe: aboutMeSetting?.value || "",
        aboutImage: aboutImageSetting?.value || "/avatar.jpg",
        heroTitle: heroTitleSetting?.value || "BAHADIR KAYGISIZ",
        heroQuote: heroQuoteSetting?.value || "Her gün daha iyiye",
        heroDescription: heroDescriptionSetting?.value || "Kişisel gelişim, psikoloji, felsefe ve hareketli yaşam üzerine yazıyor ve youtube videosu paylaşıyorum.",
        heroTitleSize: heroTitleSizeSetting?.value || "text-xl md:text-3xl",
        heroTitleFont: heroTitleFontSetting?.value || "font-mono",
        heroQuoteSize: heroQuoteSizeSetting?.value || "text-6xl md:text-[110px] lg:text-[140px]",
        heroQuoteFont: heroQuoteFontSetting?.value || "font-serif text-2xl font-bold italic",
        heroDescSize: heroDescSizeSetting?.value || "text-lg md:text-xl lg:text-2xl",
        heroDescFont: heroDescFontSetting?.value || "font-medium"
    };

    return <AdminSettingsClient settings={settings} />;
}
