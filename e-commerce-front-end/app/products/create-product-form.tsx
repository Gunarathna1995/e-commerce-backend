"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type ProductPayload = {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    is_active: boolean;
};

function decodeRoleFromToken(token: string): string {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            return "";
        }

        const encoded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(encoded)) as { role?: unknown };
        return typeof payload.role === "string" ? payload.role : "";
    } catch {
        return "";
    }
}

function normalizeApiError(payload: unknown): string {
    if (
        typeof payload === "object" &&
        payload !== null &&
        "detail" in payload &&
        typeof (payload as { detail?: unknown }).detail === "string"
    ) {
        return (payload as { detail: string }).detail;
    }

    return "Could not create product.";
}


function getAuthFromStorage() {
    if (typeof window === "undefined") {
        return { token: "", tokenType: "bearer", role: "" };
    }

    const token = localStorage.getItem("access_token") ?? "";
    const tokenType = localStorage.getItem("token_type") ?? "bearer";
    const storedRole = localStorage.getItem("user_role") ?? "";
    const role = (storedRole || decodeRoleFromToken(token)).toLowerCase();

    return { token, tokenType, role };
}

export default function CreateProductForm() {

    const router = useRouter();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("1");
    const [stock, setStock] = useState("1");
    const [category, setCategory] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [auth] = useState(getAuthFromStorage);

    const canSubmit =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    category.trim().length > 0 &&
    Number(price) > 0 &&
    Number(stock) >= 0 &&
    !isLoading;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!auth.token) {
            setErrorMessage("Login is required to create products.");
            return;
        }

        if (auth.role !== "admin") {
            setErrorMessage("Only admin users can create products.");
            return;
        }

        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const payload: ProductPayload = {
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            stock: Number.parseInt(stock, 10),
            category: category.trim(),
            is_active: isActive,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `${auth.tokenType} ${auth.token}`,
                },
                body: JSON.stringify(payload),
            });

            const responsePayload = (await response
                .json()
                .catch(() => null)) as unknown;

            if (!response.ok) {
                setErrorMessage(normalizeApiError(responsePayload));
                return;
            }

            setSuccessMessage("Product created successfully.");
            setName("");
            setDescription("");
            setPrice("1");
            setStock("1");
            setCategory("");
            setIsActive(true);
            router.refresh();
        } catch {
            setErrorMessage(
                "Cannot reach API server. Is backend running on port 8000?",
            );
        } finally {
            setIsLoading(false);
        }
    }

    if (!auth.token) {
        return (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                Login required: only admin users can create products.
            </div>
        );
    }

    if (auth.role !== "admin") {
        return (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                Access denied: current user is not admin.
            </div>
        );
    }

    return (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
                Create Product (Admin)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
                This sends POST /products with your bearer token.
            </p>

            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="product-name"
                >
                    Name
                    <input
                        id="product-name"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                    />
                </label>

                <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="product-category"
                >
                    Category
                    <input
                        id="product-category"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        required
                    />
                </label>

                <label
                    className="text-sm font-medium text-slate-700 sm:col-span-2"
                    htmlFor="product-description"
                >
                    Description
                    <textarea
                        id="product-description"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                        required
                    />
                </label>

                <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="product-price"
                >
                    Price
                    <input
                        id="product-price"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        required
                    />
                </label>

                <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="product-stock"
                >
                    Stock
                    <input
                        id="product-stock"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        type="number"
                        min="0"
                        step="1"
                        value={stock}
                        onChange={(event) => setStock(event.target.value)}
                        required
                    />
                </label>

                <label
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2"
                    htmlFor="product-active"
                >
                    <input
                        id="product-active"
                        type="checkbox"
                        checked={isActive}
                        onChange={(event) => setIsActive(event.target.checked)}
                    />
                    Product is active
                </label>

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="sm:col-span-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    {isLoading ? "Creating..." : "Create Product"}
                </button>
            </form>

            {errorMessage ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errorMessage}
                </p>
            ) : null}

            {successMessage ? (
                <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {successMessage}
                </p>
            ) : null}
        </section>
    );

}