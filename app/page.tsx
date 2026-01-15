"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  const handleRoleSelect = (role: string) => {
    sessionStorage.setItem("selectedRole", role);
    router.push(`/auth/signup?role=${role}`);
  };

  const handleRoleLogin = (role: string) => {
    sessionStorage.setItem("selectedRole", role);
    router.push(`/auth/login?role=${role}`);
  };

  const roles = [
    {
      id: "patient",
      title: "Patient",
      description: "Access your medical records and appointments",
    },
    {
      id: "doctor",
      title: "Doctor",
      description: "Manage patients and medical sessions",
    },
    {
      id: "admin",
      title: "Admin",
      description: "Manage accounts and system settings",
    },
    {
      id: "hospital",
      title: "Hospital",
      description: "Manage hospital operations and staff",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>SaraMedico</h1>
          <p className={styles.subtitle}>Select your role to continue</p>
        </div>

        <div className={styles.roleGrid}>
          {roles.map((role) => (
            <div key={role.id} className={styles.roleCard}>
              <div className={styles.roleIcon}>
              </div>
              <h3 className={styles.roleTitle}>{role.title}</h3>
              <p className={styles.roleDescription}>{role.description}</p>

              <div className={styles.roleActions}>
                <button
                  onClick={() => handleRoleLogin(role.id)}
                  className={styles.secondaryBtn}
                >
                  Login
                </button>
                <button
                  onClick={() => handleRoleSelect(role.id)}
                  className={styles.primaryBtn}
                >
                  Sign Up
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
