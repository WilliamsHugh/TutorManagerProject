"use client";

import HubLoginSidebar from "./_components/HubLoginSidebar";
import HubLoginForm from "./_components/HubLoginForm";

export default function HubLoginClient() {
    return (
        <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
            {/* Left Sidebar */}
            <HubLoginSidebar />

            {/* Right Form Area */}
            <HubLoginForm />
        </div>
    );
}
