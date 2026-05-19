"use client";

import HubLoginSidebar from "./components/HubLoginSidebar";
import HubLoginForm from "./components/HubLoginForm";

export default function HubLoginPage() {
    return (
        <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
            {/* Left Sidebar */}
            <HubLoginSidebar />

            {/* Right Form Area */}
            <HubLoginForm />
        </div>
    );
}
