"use client";

import LoginSidebar from "./_components/LoginSidebar";
import LoginForm from "./_components/LoginForm";

export default function LoginPageClient() {
    return (
        <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
            {/* Left Sidebar */}
            <LoginSidebar />

            {/* Right Form Area */}
            <LoginForm />
        </div>
    );
}
