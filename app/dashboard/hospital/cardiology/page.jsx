"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect the old static /cardiology route to the dynamic department template
export default function CardiologyRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/dashboard/hospital/departments/cardiology");
    }, [router]);
    return null;
}
