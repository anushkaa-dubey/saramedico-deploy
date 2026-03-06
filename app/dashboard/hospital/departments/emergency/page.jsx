"use client";
// Static route for /departments/emergency — renders the shared department template
import DepartmentPage from "../[departmentName]/page";

export default function EmergencyPage() {
    return <DepartmentPage params={Promise.resolve({ departmentName: "emergency" })} />;
}