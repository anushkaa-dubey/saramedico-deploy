"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import logo from "@/public/logo.png";

export default function Home() {
  const router = useRouter();

  const handleRoleSelect = (role) => {
    // Store role in sessionStorage for this session
    sessionStorage.setItem("selectedRole", role);
    // Redirect to signup with role
    router.push(`/auth/signup?role=${role}`);
  };

  const handleRoleLogin = (role) => {
    // Store role in sessionStorage for this session
    sessionStorage.setItem("selectedRole", role);
    // Redirect to login with role
    router.push(`/auth/login?role=${role}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={logo.src} alt="SaraMedico" className={styles.logo} />
        <h1 className={styles.title}>SaraMedico</h1>
        <p className={styles.subtitle}>Healthcare Platform</p>
      </div>

      <div className={styles.content}>
        <h2 className={styles.heading}>Select Your Role</h2>
        <p className={styles.description}>
          Choose your role to continue with sign up or login
        </p>

        <div className={styles.roleGrid}>
          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>👤</div>
            <h3 className={styles.roleTitle}>Patient</h3>
            <p className={styles.roleDescription}>
              Access your medical records and appointments
            </p>
            <div className={styles.roleActions}>
              <button
                className={styles.primaryBtn}
                onClick={() => handleRoleSelect("patient")}
              >
                Sign Up
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() => handleRoleLogin("patient")}
              >
                Login
              </button>
            </div>
          </div>

          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>👨‍⚕️</div>
            <h3 className={styles.roleTitle}>Doctor</h3>
            <p className={styles.roleDescription}>
              Manage patients and medical sessions
            </p>
            <div className={styles.roleActions}>
              <button
                className={styles.primaryBtn}
                onClick={() => handleRoleSelect("doctor")}
              >
                Sign Up
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() => handleRoleLogin("doctor")}
              >
                Login
              </button>
            </div>
          </div>

          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>👔</div>
            <h3 className={styles.roleTitle}>Admin</h3>
            <p className={styles.roleDescription}>
              Manage accounts and system settings
            </p>
            <div className={styles.roleActions}>
              <button
                className={styles.primaryBtn}
                onClick={() => handleRoleSelect("admin")}
              >
                Sign Up
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() => handleRoleLogin("admin")}
              >
                Login
              </button>
            </div>
          </div>

          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>🏥</div>
            <h3 className={styles.roleTitle}>Hospital</h3>
            <p className={styles.roleDescription}>
              Manage hospital operations and staff
            </p>
            <div className={styles.roleActions}>
              <button
                className={styles.primaryBtn}
                onClick={() => handleRoleSelect("hospital")}
              >
                Sign Up
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() => handleRoleLogin("hospital")}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
