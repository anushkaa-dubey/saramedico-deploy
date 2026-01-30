"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HospitalDashboardRoot() {
    const router = useRouter();
    useEffect(() => {
        router.push("/dashboard/hospital/cardiology");
    }, [router]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Redirecting to Cardiology Department...</p>
        </div>
    );
}
