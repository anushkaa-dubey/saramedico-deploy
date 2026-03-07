// "use client";
// import { useState, useEffect } from "react";
// import { fetchAdminDoctorDetails } from "@/services/admin";

// export default function DoctorDetailsModal({ isOpen, onClose, doctorId }) {
//     const [details, setDetails] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         if (isOpen && doctorId) {
//             const loadDetails = async () => {
//                 setLoading(true);
//                 try {
//                     const data = await fetchAdminDoctorDetails(doctorId);
//                     setDetails(data);
//                 } catch (err) {
//                     console.error("Failed to load doctor details:", err);
//                 } finally {
//                     setLoading(false);
//                 }
//             };
//             loadDetails();
//         }
//     }, [isOpen, doctorId]);

//     if (!isOpen) return null;

//     return (
//         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
//             <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
//                     <div>
//                         <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>Doctor Profile</h2>
//                         <p style={{ color: '#64748b', fontSize: '14px' }}>Detailed clinical performance and administrative records.</p>
//                     </div>
//                     <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
//                 </div>

//                 {loading ? (
//                     <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading profile details...</div>
//                 ) : !details ? (
//                     <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>Failed to load profile.</div>
//                 ) : (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
//                         {/* Header Stats */}
//                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
//                             <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
//                                 <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Total Patients</div>
//                                 <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginTop: '4px' }}>{details.stats?.totalPatients || 0}</div>
//                             </div>
//                             <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
//                                 <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Consultations</div>
//                                 <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginTop: '4px' }}>{details.stats?.consultations || 0}</div>
//                             </div>
//                             <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
//                                 <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Rating</div>
//                                 <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{details.stats?.rating || "N/A"} ★</div>
//                             </div>
//                             <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
//                                 <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Status</div>
//                                 <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981', background: '#f0fdf4', padding: '4px 8px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>{details.status?.toUpperCase() || "ACTIVE"}</div>
//                             </div>
//                         </div>

//                         {/* Professional Details */}
//                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
//                             <div>
//                                 <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>Identity & Licensing</h3>
//                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                                     <div>
//                                         <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>FULL NAME</label>
//                                         <div style={{ fontSize: '14px', fontWeight: '600' }}>Dr. {details.first_name} {details.last_name}</div>
//                                     </div>
//                                     <div>
//                                         <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>SPECIALTY</label>
//                                         <div style={{ fontSize: '14px', fontWeight: '600' }}>{details.specialty || "General Medicine"}</div>
//                                     </div>
//                                     <div>
//                                         <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>LICENSE NO.</label>
//                                         <div style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'monospace' }}>{details.license || "N/A"}</div>
//                                     </div>
//                                     <div>
//                                         <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>JOINED DATE</label>
//                                         <div style={{ fontSize: '14px', fontWeight: '600' }}>{details.joinedDate || "N/A"}</div>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div>
//                                 <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>Contact Information</h3>
//                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                                     <div>
//                                         <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>EMAIL ADDRESS</label>
//                                         <div style={{ fontSize: '14px', fontWeight: '600' }}>{details.email}</div>
//                                     </div>
//                                     <div>
//                                         <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>PHONE NUMBER</label>
//                                         <div style={{ fontSize: '14px', fontWeight: '600' }}>{details.phone || "N/A"}</div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Recent Appointments Table */}
//                         <div>
//                             <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>Upcoming Appointments</h3>
//                             <div style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
//                                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
//                                     <thead style={{ background: '#f8fafc' }}>
//                                         <tr>
//                                             <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '800', color: '#94a3b8' }}>PATIENT</th>
//                                             <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '800', color: '#94a3b8' }}>TIME</th>
//                                             <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '800', color: '#94a3b8' }}>STATUS</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {details.appointments?.length > 0 ? details.appointments.map((appt, idx) => (
//                                             <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
//                                                 <td style={{ padding: '12px 16px', fontWeight: '700' }}>{appt.patientName}</td>
//                                                 <td style={{ padding: '12px 16px', color: '#64748b' }}>{appt.time}</td>
//                                                 <td style={{ padding: '12px 16px' }}>
//                                                     <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#3b82f6' }}>{appt.status}</span>
//                                                 </td>
//                                             </tr>
//                                         )) : (
//                                             <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No upcoming sessions.</td></tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }
export default function SettingsPage() {
  return null;
}