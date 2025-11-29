import Link from "next/link";
import ViewSecret from "@/components/ViewSecret";

type PageProps = {
  params: {
    id: string;
  };
};

export default function ViewPage({ params }: PageProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-4xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-black hover:text-blue-500 transition-colors text-sm font-bold uppercase tracking-wide border-2 border-black px-4 py-2 bg-white hover:bg-blue-50 shadow-[4px_4px_0_0_rgb(0,0,0)] hover:shadow-[2px_2px_0_0_rgb(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          ← Back to Home
        </Link>
        <ViewSecret id={params.id} />
      </div>
    </main>
  );
}

