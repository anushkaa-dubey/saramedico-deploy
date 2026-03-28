"use client";

import { Suspense } from "react";
import AuthLayout from "../components/AuthLayout";
import ResetPasswordForm from "../components/ResetPasswordForm";

function ResetPasswordContent() {
    return (
        <AuthLayout>
            <ResetPasswordForm />
        </AuthLayout>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="reset-pw-container">
                    <div className="reset-pw-card">
                        <div className="verify-email-spinner" />
                        <p className="reset-pw-message">Loading…</p>
                    </div>
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
