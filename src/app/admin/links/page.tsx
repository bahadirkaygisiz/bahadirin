import { prisma } from "../../../lib/prisma";
import AdminLinksClient from "./AdminLinksClient";

export default async function LinksAdminPage() {
    const links = await prisma.link.findMany({ orderBy: { order: 'asc' } });

    return (
        <div>
            <h1 className="text-2xl font-bold font-serif mb-6">Linkleri Yönet</h1>
            <AdminLinksClient initialLinks={links} />
        </div>
    );
}
