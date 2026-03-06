"use client";
// Static route for /departments/cardiology — renders the shared department template
import DepartmentPage from "../[departmentName]/page";

export default function CardiologyPage() {
    // Provide fake params to satisfy the shared component
    return <DepartmentPage params={Promise.resolve({ departmentName: "cardiology" })} />;
}