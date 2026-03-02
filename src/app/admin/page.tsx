import { prisma } from "../../lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const postCount = await prisma.post.count();
    const linkCount = await prisma.link.count();

    return <AdminDashboardClient postCount={postCount} linkCount={linkCount} />;
}
