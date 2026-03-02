import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
import AdminPostEditor from "../../../components/AdminPostEditor";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) notFound();

    return <AdminPostEditor initialData={post as any} />;
}
