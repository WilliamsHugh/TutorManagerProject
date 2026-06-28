"use client";

import LoginSidebar from "../login/_components/LoginSidebar";
import ForgotPasswordForm from "./_components/ForgotPasswordForm";

export default function ForgotPasswordClient() {
    return (
        <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
            {/* Left Sidebar */}
            <LoginSidebar />

            {/* Right Form Area */}
            <ForgotPasswordForm />
        </div>
    );
}
