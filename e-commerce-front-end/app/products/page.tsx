import Link from "next/link";
import CeateProductForm from "./create-product-form";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const PAGE_SIZE = 6;

type Product = {
    id: number;
    name: string;
    description: string;
    price: string;
    stock: number;
    category: string;
    is_active: boolean;
};

type ProductsResponse = {
    items: Product[];
};


type ProductsPageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};


export default async function ProductsPage({ searchParams }: ProductsPageProps) {


    const query = await searchParams;
    const rawSkip = Array.isArray(query.skip) ? query.skip[0] : query.skip;
    const rawLimit = Array.isArray(query.limit) ? query.limit[0] : query.limit;

    const parsedSkip = Number.parseInt(rawSkip ?? "0", 10);
    const parsedLimit = Number.parseInt(rawLimit ?? `${PAGE_SIZE}`, 10);

    const skip = Number.isNaN(parsedSkip) || parsedSkip < 0 ? 0 : parsedSkip;
    const limit =
        Number.isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50
            ? PAGE_SIZE
            : parsedLimit;

    let items: Product[] = [];
    let errorMessage = "";


    try {
        const response = await fetch(
            `${API_BASE_URL}/products?skip=${skip}&limit=${limit}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
                cache: "no-store",
            },
        );

        const payload = (await response
            .json()
            .catch(() => null)) as ProductsResponse | null;

        if (!response.ok || !payload || !Array.isArray(payload.items)) {
            errorMessage = "Could not load products.";
        } else {
            items = payload.items;
        }
    } catch {
        errorMessage = "Cannot reach API server. Is backend running on port 8000?";
    }


    const pageNumber = Math.floor(skip / limit) + 1;
    const canGoPrev = skip > 0;
    const canGoNext = items.length >= limit;
    const prevSkip = Math.max(skip - limit, 0);
    const nextSkip = skip + limit;

    return (
        <main className="min-h-screen bg-[linear-gradient(120deg,#f0f9ff_0%,#ffffff_45%,#ecfeff_100%)] px-4 py-12">
            <section className="mx-auto w-full max-w-5xl rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_16px_60px_-28px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-900"
                    >
                        Back Home
                    </Link>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm text-slate-700">Page {pageNumber}</p>
                    <div className="flex gap-3">
                        <Link
                            href={`/products?skip=${prevSkip}&limit=${limit}`}
                            aria-disabled={!canGoPrev}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-700 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        >
                            Previous
                        </Link>
                        <Link
                            href={`/products?skip=${nextSkip}&limit=${limit}`}
                            aria-disabled={!canGoNext}
                            className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 aria-disabled:pointer-events-none aria-disabled:bg-cyan-300"
                        >
                            Next
                        </Link>
                    </div>
                </div>

                {errorMessage ? (
                    <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {errorMessage}
                    </p>
                ) : null}

                {!errorMessage && items.length === 0 ? (
                    <p className="mt-6 text-sm text-slate-600">No products found.</p>
                ) : null}

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((product) => (
                        <article
                            key={product.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="text-base font-semibold text-slate-900">
                                    {product.name}
                                </h2>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                    #{product.id}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                                {product.description}
                            </p>

                            <div className="mt-4 space-y-1 text-sm">
                                <p className="text-slate-700">
                                    Price: <span className="font-semibold">${product.price}</span>
                                </p>
                                <p className="text-slate-700">Stock: {product.stock}</p>
                                <p className="text-slate-700">Category: {product.category}</p>
                                <p className="text-slate-700">
                                    Status: {product.is_active ? "Active" : "Inactive"}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>

                <CeateProductForm/>

            </section>
        </main>
    );


}