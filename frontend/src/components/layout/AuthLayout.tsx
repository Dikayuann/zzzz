import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
    footerText: string;
    footerLinkText: string;
    footerLinkHref: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
                                                          children,
                                                          title,
                                                          description,
                                                          footerText,
                                                          footerLinkText,
                                                          footerLinkHref,
                                                      }) => {
    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 p-4 relative">

            {/* 1. TOMBOL BACK / KEMBALI KE LANDING PAGE */}
            <Link
                to="/"
                className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
            </Link>

            <div className="w-full max-w-[380px]">
                {/* 2. HEADER KARTU (Judul & Deskripsi) */}
                <div className="text-center mb-6">
                    <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {title}
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                        {description}
                    </p>
                </div>

                {/* 3. KARTU TEMPAT FORM (Children) */}
                <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-sm">
                    {children}
                </div>

                {/* 4. FOOTER LINK DI BAWAH KARTU */}
                <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
                    {footerText}{" "}
                    <Link
                        to={footerLinkHref}
                        className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4"
                    >
                        {footerLinkText}
                    </Link>
                </p>
            </div>

        </div>
    );
};
