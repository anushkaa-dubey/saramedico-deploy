"use client";
import { useState, useEffect } from "react";
/// "use client";
// import { useState, useEffect } from "react";
// import Topbar from "../components/Topbar";
// import styles from "../HospitalDashboard.module.css";
// import { motion, AnimatePresence } from "framer-motion";
// // import { fetchAdminSettings, updateOrgSettings, updateDevSettings, updateBackupSettings } from "@/services/admin";

// export default function SettingsPage() {
//     const [activeTab, setActiveTab] = useState("organization");
//     const [settings, setSettings] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [message, setMessage] = useState({ type: "", text: "" });

//     // const loadSettings = async () => {
//     //     setLoading(true);
//     //     try {
//     //         const data = await fetchAdminSettings();
//     //         setSettings(data);
//     //     } catch (err) {
//     //         console.error("Failed to load admin settings:", err);
//     //         setMessage({ type: "error", text: "Failed to load settings." });
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };

//     useEffect(() => {
//         loadSettings();
//     }, []);

//     // const handleUpdateOrg = async (e) => {
//     //     e.preventDefault();
//     //     setSaving(true);
//     //     setMessage({ type: "", text: "" });
//     //     try {
//     //         const formData = new FormData(e.target);
//     //         const payload = Object.fromEntries(formData);
//     //         await updateOrgSettings(payload);
//     //         setMessage({ type: "success", text: "Organization settings updated successfully." });
//     //         loadSettings();
//     //     } catch (err) {
//     //         setMessage({ type: "error", text: "Failed to update organization settings." });
//     //     } finally {
//     //         setSaving(false);
//     //     }
//     // };

//     // const handleUpdateDev = async (e) => {
//     //     e.preventDefault();
//     //     setSaving(true);
//     //     setMessage({ type: "", text: "" });
//     //     try {
//     //         const formData = new FormData(e.target);
//     //         const payload = Object.fromEntries(formData);
//     //         await updateDevSettings(payload);
//     //         setMessage({ type: "success", text: "Developer settings updated successfully." });
//     //         loadSettings();
//     //     } catch (err) {
//     //         setMessage({ type: "error", text: "Failed to update developer settings." });
//     //     } finally {
//     //         setSaving(false);
//     //     }
//     // };

//     // const handleUpdateBackup = async (e) => {
//     //     e.preventDefault();
//     //     setSaving(true);
//     //     setMessage({ type: "", text: "" });
//     //     try {
//     //         const formData = new FormData(e.target);
//     //         const payload = Object.fromEntries(formData);
//     //         await updateBackupSettings(payload);
//     //         setMessage({ type: "success", text: "Backup settings updated successfully." });
//     //         loadSettings();
//     //     } catch (err) {
//     //         setMessage({ type: "error", text: "Failed to update backup settings." });
//     //     } finally {
//     //         setSaving(false);
//     //     }
//     // };

//     if (loading) {
//         return (
//             <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
//                 <Topbar title="Admin Settings" />
//                 <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading administrative configuration...</div>
//             </div>
//         );
//     }

//     const tabs = [
//         { id: "organization", label: "Organization", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3"></path><path d="M19 21V11"></path><path d="M5 21V11"></path></svg> },
//         { id: "developer", label: "Developer", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> },
//         { id: "backup", label: "Backups", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> }
//     ];

//     return (
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
//         >
//             <Topbar title="Enterprise Configuration" />

//             <div className={styles.contentWrapper}>
//                 <div style={{ marginBottom: '32px' }}>
//                     <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Enterprise Settings</h1>
//                     <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Manage organization profile, developer integrations, and data backup policies.</p>
//                 </div>

//                 {message.text && (
//                     <div style={{
//                         padding: '16px',
//                         borderRadius: '12px',
//                         marginBottom: '24px',
//                         background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
//                         color: message.type === 'success' ? '#166534' : '#991b1b',
//                         border: `1px solid ${message.type === 'success' ? '#dcfce7' : '#fee2e2'}`,
//                         fontSize: '14px',
//                         fontWeight: '600'
//                     }}>
//                         {message.text}
//                     </div>
//                 )}

//                 <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
//                     {/* Sidebar Tabs */}
//                     <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
//                         {tabs.map(tab => (
//                             <button
//                                 key={tab.id}
//                                 onClick={() => { setActiveTab(tab.id); setMessage({ type: "", text: "" }); }}
//                                 style={{
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     gap: '12px',
//                                     padding: '12px 16px',
//                                     borderRadius: '10px',
//                                     border: 'none',
//                                     background: activeTab === tab.id ? '#3b82f6' : 'transparent',
//                                     color: activeTab === tab.id ? 'white' : '#64748b',
//                                     fontSize: '14px',
//                                     fontWeight: '700',
//                                     textAlign: 'left',
//                                     cursor: 'pointer',
//                                     transition: 'all 0.2s'
//                                 }}
//                             >
//                                 {tab.icon}
//                                 {tab.label}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Content Area */}
//                     <div style={{ flex: 1, background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #f1f5f9' }}>
//                         <AnimatePresence mode="wait">
//                             {activeTab === 'organization' && (
//                                 <motion.div
//                                     key="org"
//                                     initial={{ opacity: 0, x: 10 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     exit={{ opacity: 0, x: -10 }}
//                                 >
//                                     <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' }}>Organization Profile</h3>
//                                     <form onSubmit={handleUpdateOrg} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
//                                             <div className={styles.formGroup}>
//                                                 <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>HOSPITAL NAME</label>
//                                                 <input
//                                                     name="name"
//                                                     required
//                                                     defaultValue={settings?.organization?.name}
//                                                     style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
//                                                 />
//                                             </div>
//                                             <div className={styles.formGroup}>
//                                                 <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>ORGANIZATION EMAIL</label>
//                                                 <input
//                                                     name="org_email"
//                                                     required
//                                                     type="email"
//                                                     defaultValue={settings?.organization?.org_email}
//                                                     style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
//                                                 />
//                                             </div>
//                                             <div className={styles.formGroup}>
//                                                 <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>TIMEZONE</label>
//                                                 <select
//                                                     name="timezone"
//                                                     defaultValue={settings?.organization?.timezone || "UTC"}
//                                                     style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white' }}
//                                                 >
//                                                     <option value="UTC">UTC (Greenwich Mean Time)</option>
//                                                     <option value="EST">EST (Eastern Standard Time)</option>
//                                                     <option value="PST">PST (Pacific Standard Time)</option>
//                                                     <option value="IST">IST (India Standard Time)</option>
//                                                 </select>
//                                             </div>
//                                             <div className={styles.formGroup}>
//                                                 <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>DATE FORMAT</label>
//                                                 <select
//                                                     name="date_format"
//                                                     defaultValue={settings?.organization?.date_format || "MM/DD/YYYY"}
//                                                     style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white' }}
//                                                 >
//                                                     <option>MM/DD/YYYY</option>
//                                                     <option>DD/MM/YYYY</option>
//                                                     <option>YYYY-MM-DD</option>
//                                                 </select>
//                                             </div>
//                                         </div>
//                                         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
//                                             <button type="submit" disabled={saving} className={styles.primaryBtn} style={{ padding: '12px 24px', opacity: saving ? 0.7 : 1 }}>
//                                                 {saving ? "Saving Changes..." : "Save Org Settings"}
//                                             </button>
//                                         </div>
//                                     </form>
//                                 </motion.div>
//                             )}

//                             {activeTab === 'developer' && (
//                                 <motion.div
//                                     key="dev"
//                                     initial={{ opacity: 0, x: 10 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     exit={{ opacity: 0, x: -10 }}
//                                 >
//                                     <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' }}>Developer Settings</h3>
//                                     <form onSubmit={handleUpdateDev} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                                         <div className={styles.formGroup}>
//                                             <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>API KEY NAME</label>
//                                             <input
//                                                 name="api_key_name"
//                                                 placeholder="e.g. Production Mobile App"
//                                                 defaultValue={settings?.developer?.api_key_name}
//                                                 style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
//                                             />
//                                         </div>
//                                         <div className={styles.formGroup}>
//                                             <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>WEBHOOK URL</label>
//                                             <input
//                                                 name="webhook_url"
//                                                 type="url"
//                                                 placeholder="https://your-server.com/webhook"
//                                                 defaultValue={settings?.developer?.webhook_url}
//                                                 style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
//                                             />
//                                         </div>
//                                         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
//                                             <button type="submit" disabled={saving} className={styles.primaryBtn} style={{ padding: '12px 24px', opacity: saving ? 0.7 : 1 }}>
//                                                 {saving ? "Saving..." : "Update Dev Settings"}
//                                             </button>
//                                         </div>
//                                     </form>
//                                 </motion.div>
//                             )}

//                             {activeTab === 'backup' && (
//                                 <motion.div
//                                     key="backup"
//                                     initial={{ opacity: 0, x: 10 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     exit={{ opacity: 0, x: -10 }}
//                                 >
//                                     <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' }}>Data Backup Policy</h3>
//                                     <form onSubmit={handleUpdateBackup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                                         <div className={styles.formGroup}>
//                                             <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>BACKUP FREQUENCY</label>
//                                             <select
//                                                 name="backup_frequency"
//                                                 defaultValue={settings?.backup?.backup_frequency || "Daily"}
//                                                 style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white' }}
//                                             >
//                                                 <option>Hourly</option>
//                                                 <option>Daily</option>
//                                                 <option>Weekly</option>
//                                                 <option>Monthly</option>
//                                             </select>
//                                         </div>
//                                         <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
//                                             <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
//                                                 <strong>Note:</strong> Automated backups are encrypted using AES-256 and stored in geographically redundant secure storage. You will receive an email notification if a backup fails.
//                                             </div>
//                                         </div>
//                                         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
//                                             <button type="submit" disabled={saving} className={styles.primaryBtn} style={{ padding: '12px 24px', opacity: saving ? 0.7 : 1 }}>
//                                                 {saving ? "Updating..." : "Update Backup Policy"}
//                                             </button>
//                                         </div>
//                                     </form>
//                                 </motion.div>
//                             )}
//                         </AnimatePresence>
//                     </div>
//                 </div>
//             </div>
//         </motion.div>
//     );
// }
export default function SettingsPage() {
  return null;
}