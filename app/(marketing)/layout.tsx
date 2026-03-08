import { Footer } from "@/components/shared/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-black">
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
