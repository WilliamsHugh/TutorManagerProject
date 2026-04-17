"use client";

import LoginSidebar from "./components/LoginSidebar";
import LoginForm from "./components/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
            {/* Left Sidebar */}
            <LoginSidebar />

            {/* Right Form Area */}
            <LoginForm />
        </div>
    );
}
