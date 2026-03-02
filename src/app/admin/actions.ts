"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/prisma";

export async function savePost(formData: FormData) {
    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string || null;
    const coverImage = formData.get("coverImage") as string || null;
    const metaDescription = formData.get("metaDescription") as string || null;
    const tags = formData.get("tags") as string || null;
    const published = formData.get("published") === "on";
    const order = parseInt(formData.get("order") as string) || 0;

    if (id) {
        await prisma.post.update({
            where: { id },
            data: { title, slug, content, excerpt, coverImage, metaDescription, tags, published, order }
        });
    } else {
        await prisma.post.create({
            data: { title, slug, content, excerpt, coverImage, metaDescription, tags, published, order }
        });
    }

    revalidatePath("/");
    revalidatePath("/admin/posts");
    if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createDraft() {
    const post = await prisma.post.create({
        data: {
            title: "Adsız Taslak",
            slug: `taslak-${Date.now()}`,
            content: "",
            published: false,
        }
    });
    revalidatePath("/admin/posts");
    return post.id;
}

export async function deletePost(id: string) {
    await prisma.post.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/posts");
}

export async function updatePostsOrder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
        prisma.post.update({ where: { id }, data: { order: index } })
    );
    await prisma.$transaction(updates);
    revalidatePath("/");
    revalidatePath("/admin/posts");
}

export async function saveLink(formData: FormData) {
    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    const icon = formData.get("icon") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    if (id) {
        await prisma.link.update({
            where: { id },
            data: { title, url, icon, order }
        });
    } else {
        await prisma.link.create({
            data: { title, url, icon, order }
        });
    }

    revalidatePath("/");
    revalidatePath("/admin/links");
}

export async function deleteLink(id: string) {
    await prisma.link.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/links");
}

export async function updateLinksOrder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
        prisma.link.update({
            where: { id },
            data: { order: index }
        })
    );
    await prisma.$transaction(updates);
    revalidatePath("/");
    revalidatePath("/admin/links");
}

export async function saveSettings(formData: FormData) {
    const aboutMe = formData.get("aboutMe") as string;
    const aboutImage = formData.get("aboutImage") as string;
    const heroTitle = formData.get("heroTitle") as string;
    const heroQuote = formData.get("heroQuote") as string;
    const heroDescription = formData.get("heroDescription") as string;

    const settings = [
        { key: 'ABOUT_ME', value: aboutMe },
        { key: 'ABOUT_IMAGE_URL', value: aboutImage },
        { key: 'HERO_TITLE', value: heroTitle },
        { key: 'HERO_QUOTE', value: heroQuote },
        { key: 'HERO_DESCRIPTION', value: heroDescription },
        { key: 'HERO_TITLE_SIZE', value: formData.get("heroTitleSize") as string },
        { key: 'HERO_TITLE_FONT', value: formData.get("heroTitleFont") as string },
        { key: 'HERO_QUOTE_SIZE', value: formData.get("heroQuoteSize") as string },
        { key: 'HERO_QUOTE_FONT', value: formData.get("heroQuoteFont") as string },
        { key: 'HERO_DESC_SIZE', value: formData.get("heroDescSize") as string },
        { key: 'HERO_DESC_FONT', value: formData.get("heroDescFont") as string },
    ];

    for (const setting of settings) {
        if (setting.value !== null) {
            await prisma.setting.upsert({
                where: { key: setting.key },
                update: { value: setting.value },
                create: { key: setting.key, value: setting.value }
            });
        }
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");
}
