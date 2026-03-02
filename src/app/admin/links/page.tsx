import { prisma } from "../../../lib/prisma";
export const dynamic = "force-dynamic";
import AdminLinksClient from "./AdminLinksClient";

export default async function LinksAdminPage() {
    const links = await prisma.link.findMany({ orderBy: { order: 'asc' } });

    return <AdminLinksClient initialLinks={links} />;
}
