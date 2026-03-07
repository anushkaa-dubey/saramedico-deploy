// "use client";
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import styles from "../AdminDashboard.module.css";
// import {
//     fetchOrgDepartments,
//     fetchDoctorsByDepartment,
//     createHospitalDoctor,
//     updateHospitalDoctor
// } from "@/services/admin";
// import { Plus, Edit2, X, Save, ChevronRight, Stethoscope, Loader2 } from "lucide-react";

// export default function DepartmentsPage() {

//     const [departments, setDepartments] = useState([]);
//     const [selectedDept, setSelectedDept] = useState(null);
//     const [doctors, setDoctors] = useState([]);

//     const [loadingDepts, setLoadingDepts] = useState(true);
//     const [loadingDoctors, setLoadingDoctors] = useState(false);

//     const [showCreate, setShowCreate] = useState(false);
//     const [editingDoctor, setEditingDoctor] = useState(null);

//     const [createForm, setCreateForm] = useState({
//         email: "",
//         password: "",
//         name: "",
//         department_role: "",
//         license_number: ""
//     });

//     const [editForm, setEditForm] = useState({
//         name: "",
//         department: "",
//         department_role: "",
//         license_number: ""
//     });

//     useEffect(() => {
//         loadDepartments();
//     }, []);

//     useEffect(() => {
//         if (selectedDept) loadDoctors(selectedDept);
//     }, [selectedDept]);

//     const loadDepartments = async () => {
//         try {
//             const data = await fetchOrgDepartments();
//             setDepartments(data || []);
//             if (data?.length) setSelectedDept(data[0]);
//         } catch (e) {
//             console.error("Departments load failed", e);
//         } finally {
//             setLoadingDepts(false);
//         }
//     };

//     const loadDoctors = async (dept) => {
//         setLoadingDoctors(true);
//         try {
//             const data = await fetchDoctorsByDepartment(dept);
//             setDoctors(data || []);
//         } catch (e) {
//             console.error("Doctors load failed", e);
//         } finally {
//             setLoadingDoctors(false);
//         }
//     };

//     const handleCreateDoctor = async () => {
//         try {
//             await createHospitalDoctor({
//                 ...createForm,
//                 department: selectedDept
//             });

//             setShowCreate(false);
//             setCreateForm({
//                 email: "",
//                 password: "",
//                 name: "",
//                 department_role: "",
//                 license_number: ""
//             });

//             loadDoctors(selectedDept);

//         } catch (e) {
//             console.error(e);
//             alert("Failed to create doctor");
//         }
//     };

//     const openEdit = (doc) => {
//         setEditingDoctor(doc);

//         setEditForm({
//             name: doc.name,
//             department: doc.department,
//             department_role: doc.department_role,
//             license_number: doc.license_number
//         });
//     };

//     const handleSaveEdit = async () => {
//         try {
//             await updateHospitalDoctor(editingDoctor.id, editForm);

//             setDoctors(prev =>
//                 prev.map(d =>
//                     d.id === editingDoctor.id ? { ...d, ...editForm } : d
//                 )
//             );

//             setEditingDoctor(null);

//         } catch (e) {
//             alert("Update failed");
//         }
//     };

//     return (
//         <motion.div style={{ width: "100%" }}>

//             <div className={styles.titleRow}>
//                 <div>
//                     <h2 className={styles.heading}>Departments & Roles</h2>
//                     <p className={styles.subtext}>
//                         Manage clinical departments and doctor assignments.
//                     </p>
//                 </div>

//                 <button
//                     className={styles.inviteBtn}
//                     onClick={() => setShowCreate(true)}
//                 >
//                     <Plus size={15} /> Add Doctor
//                 </button>
//             </div>

//             <div style={{
//                 display: "grid",
//                 gridTemplateColumns: "240px 1fr",
//                 gap: "20px"
//             }}>

//                 {/* Department List */}

//                 <div className={styles.card} style={{ padding: "12px" }}>

//                     {loadingDepts ? (
//                         <div style={{ padding: "20px" }}>Loading...</div>
//                     ) : departments.length === 0 ? (
//                         <div style={{ padding: "20px" }}>No departments found.</div>
//                     ) : (
//                         departments.map((dept) => {

//                             const active = selectedDept === dept;

//                             return (
//                                 <button
//                                     key={dept}
//                                     onClick={() => setSelectedDept(dept)}
//                                     style={{
//                                         width: "100%",
//                                         padding: "10px",
//                                         border: "none",
//                                         borderRadius: "8px",
//                                         textAlign: "left",
//                                         background: active ? "#eff6ff" : "transparent",
//                                         color: active ? "#2563eb" : "#475569",
//                                         fontWeight: "600",
//                                         cursor: "pointer"
//                                     }}
//                                 >
//                                     {dept}

//                                     {active && (
//                                         <ChevronRight
//                                             size={14}
//                                             style={{ float: "right" }}
//                                         />
//                                     )}

//                                 </button>
//                             );
//                         })
//                     )}

//                 </div>


//                 {/* Doctors Table */}

//                 <div className={styles.card}>

//                     <div className={styles.cardHeader}>
//                         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//                             <Stethoscope size={18} />
//                             <h3>{selectedDept}</h3>
//                         </div>
//                     </div>

//                     {loadingDoctors ? (
//                         <div style={{ padding: "40px", textAlign: "center" }}>
//                             <Loader2 size={16} />
//                         </div>
//                     ) : doctors.length === 0 ? (
//                         <div style={{ padding: "40px", textAlign: "center" }}>
//                             No doctors in this department.
//                         </div>
//                     ) : (

//                         <table className={styles.table}>

//                             <thead>
//                                 <tr>
//                                     <th>Doctor</th>
//                                     <th>Role</th>
//                                     <th style={{ textAlign: "right" }}>Actions</th>
//                                 </tr>
//                             </thead>

//                             <tbody>

//                                 {doctors.map(doc => (

//                                     <tr key={doc.id}>

//                                         <td>{doc.name}</td>

//                                         <td>{doc.department_role || "Doctor"}</td>

//                                         <td style={{ textAlign: "right" }}>

//                                             <button
//                                                 onClick={() => openEdit(doc)}
//                                                 style={{
//                                                     background: "#eff6ff",
//                                                     border: "none",
//                                                     padding: "6px 10px",
//                                                     borderRadius: "6px",
//                                                     cursor: "pointer"
//                                                 }}
//                                             >
//                                                 <Edit2 size={12} /> Edit
//                                             </button>

//                                         </td>

//                                     </tr>

//                                 ))}

//                             </tbody>

//                         </table>

//                     )}

//                 </div>

//             </div>


//             {/* Create Modal */}

//             <AnimatePresence>

//                 {showCreate && (

//                     <div className={styles.modalOverlay}>

//                         <div className={styles.modal}>

//                             <h3>Create Doctor</h3>

//                             <input
//                                 placeholder="Name"
//                                 value={createForm.name}
//                                 onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
//                             />

//                             <input
//                                 placeholder="Email"
//                                 value={createForm.email}
//                                 onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
//                             />

//                             <input
//                                 placeholder="Password"
//                                 value={createForm.password}
//                                 onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
//                             />

//                             <input
//                                 placeholder="License Number"
//                                 value={createForm.license_number}
//                                 onChange={e => setCreateForm({ ...createForm, license_number: e.target.value })}
//                             />

//                             <input
//                                 placeholder="Department Role"
//                                 value={createForm.department_role}
//                                 onChange={e => setCreateForm({ ...createForm, department_role: e.target.value })}
//                             />

//                             <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>

//                                 <button onClick={() => setShowCreate(false)}>Cancel</button>

//                                 <button onClick={handleCreateDoctor}>
//                                     Create
//                                 </button>

//                             </div>

//                         </div>

//                     </div>

//                 )}

//             </AnimatePresence>


//             {/* Edit Modal */}

//             <AnimatePresence>

//                 {editingDoctor && (

//                     <div className={styles.modalOverlay}>

//                         <div className={styles.modal}>

//                             <h3>Edit Doctor</h3>

//                             <input
//                                 value={editForm.name}
//                                 onChange={e => setEditForm({ ...editForm, name: e.target.value })}
//                             />

//                             <input
//                                 value={editForm.department_role}
//                                 onChange={e => setEditForm({ ...editForm, department_role: e.target.value })}
//                             />

//                             <input
//                                 value={editForm.license_number}
//                                 onChange={e => setEditForm({ ...editForm, license_number: e.target.value })}
//                             />

//                             <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>

//                                 <button onClick={() => setEditingDoctor(null)}>
//                                     Cancel
//                                 </button>

//                                 <button onClick={handleSaveEdit}>
//                                     Save
//                                 </button>

//                             </div>

//                         </div>

//                     </div>

//                 )}

//             </AnimatePresence>

//         </motion.div>
//     );
// }
"use client";

export default function SettingsPage() {
  return null;
}