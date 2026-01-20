"use client";
import Topbar from "../components/Topbar";
import { motion } from "framer-motion";

export default function ProfilePage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '24px' }}
        >
            <Topbar />
            <div style={{ marginTop: '24px', background: 'white', padding: '32px', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>My Profile</h2>
                <p style={{ color: '#64748b' }}>Manage your account settings and preferences here.</p>

                {/* Placeholder Content */}
                <div style={{ marginTop: '24px', height: '200px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    Profile Content Coming Soon
                </div>
            </div>
        </motion.div>
    );
}
