"use client";

import LoginSidebar from "../login/components/LoginSidebar";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
            {/* Left Sidebar */}
            <LoginSidebar />

            {/* Right Form Area */}
            <ForgotPasswordForm />
        </div>
    );
}
