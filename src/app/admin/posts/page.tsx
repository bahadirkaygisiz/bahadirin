import { prisma } from "../../../lib/prisma";
import AdminPostsClient from "./AdminPostsClient";

export default async function PostsAdminPage() {
    const posts = await prisma.post.findMany({ orderBy: { order: 'asc' } });

    return (
        <div className="max-w-[1400px] mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold font-serif">Makale Yönetimi</h1>
                <p className="text-zinc-500 text-sm mt-1">İçeriklerinizi düzenleyin, sıralayın ve yayınlayın.</p>
            </header>
            <AdminPostsClient initialPosts={posts} />
        </div>
    );
}
