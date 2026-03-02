import AdminSidebar from "./components/AdminSidebar";
import { Toaster } from "react-hot-toast";

export const metadata = {
    title: "Yönetici Paneli | Bahadır Kaygısız",
    robots: { index: false, follow: false },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-zinc-300 flex flex-col md:flex-row overflow-x-hidden">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#0a0a0a',
                        color: '#fff',
                        border: '1px solid #27272a',
                        borderRadius: '16px',
                        padding: '16px',
                        fontWeight: '600'
                    },
                    success: {
                        iconTheme: {
                            primary: '#f59e0b',
                            secondary: '#000',
                        },
                    },
                }}
            />

            <AdminSidebar />

            <main className="flex-1 min-h-screen relative p-4 md:p-12 lg:p-20 overflow-y-auto">
                {/* Subtle background glow */}
                <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 blur-[150px] pointer-events-none -z-10" />

                <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {children}
                </div>
            </main>
        </div>
    );
}
