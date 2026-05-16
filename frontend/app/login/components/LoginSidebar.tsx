"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginSidebar() {
    return (
        <aside
            className="hidden lg:flex lg:w-[440px] flex-col px-12 py-12"
            style={{
                backgroundColor: "#1e3a8a",
                color: "white",
            }}
        >
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 text-2xl font-bold mb-20">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "white" }}
                >
                    <BookOpen size={24} style={{ color: "#1e3a8a" }} />
                </div>
                <span>TutorHub</span>
            </Link>

            {/* Quote Section */}
            <div className="mb-auto">
                <h2 className="text-4xl font-bold mb-4 leading-tight">
                    Chào mừng trở lại
                </h2>
                <p className="text-lg opacity-80 leading-relaxed">
                    Đăng nhập để tiếp tục hành trình học tập hoặc giảng dạy của bạn trên TutorHub.
                </p>
            </div>

            {/* Illustration */}
            <div className="mt-auto w-full">
                <Image
                    src="https://storage.googleapis.com/banani-generated-images/generated-images/85f6ae38-4476-462d-883e-521daf93b7af.jpg"
                    loading="eager"
                    alt="Learning Illustration"
                    width={344}
                    height={258}
                    className="w-full rounded-xl shadow-2xl object-cover"
                    style={{ width: 'auto', height: 'auto' }}
                    unoptimized
                />
            </div>
        </aside>
    );
}
