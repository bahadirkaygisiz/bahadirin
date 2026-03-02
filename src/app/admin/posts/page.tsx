import { prisma } from "../../../lib/prisma";
export const dynamic = "force-dynamic";
import AdminPostsClient from "./AdminPostsClient";

export default async function PostsAdminPage() {
    const posts = await prisma.post.findMany({ orderBy: { order: 'asc' } });

    return <AdminPostsClient initialPosts={posts} />;
}
