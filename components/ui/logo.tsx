import { Code2 } from "lucide-react";
import Link from "next/link";
function logo() {
    return (
        <>
            <Link href="/" className="flex gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/40">
                    <Code2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-black text-white">
                    code<span className="text-orange-500">Carft</span>
                </span>
            </Link>
        </>
    );
}

export default logo;
