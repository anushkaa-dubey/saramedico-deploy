"use client";

import Topbar from "../components/Topbar";
import RecordsTable from "./components/RecordsTable";
import styles from "./Records.module.css";
import Link from "next/link";
import Image from "next/image";
import benjaminImage from "@/public/icons/images/benjamin frank.png";
import basic_information from "@/public/icons/basic_information.svg";
import contact from "@/public/icons/contact.svg";
import { useState } from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function RecordsPage() {
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Topbar />
      </motion.div>

      <motion.section className={styles.wrapper} variants={itemVariants}>
        <div className={styles.pageHeader}>
          <h2>Personal Details</h2>
          <p>Manage your personal information, contact details, and secure identification.</p>
        </div>

        <motion.div className={styles.detailsCard} variants={itemVariants}>
          {/* Left Avatar */}
          <div className={styles.avatarSection}>
            <img src={benjaminImage.src} alt="Benjamin Frank" className={styles.bigAvatar} style={{ objectFit: "cover" }} />
            <h3 className={styles.profileName}>Benjamin Frank</h3>
            <span className={styles.mrn}>MRN: 849-221-009</span>
          </div>

          {/* Right Forms */}
          <div className={styles.formSection}>
            {/* Basic Info */}
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>  <Image src={basic_information} alt="Basic Information" /> Basic Information</span>
              <button className={styles.editBtn} onClick={() => setIsEditingBasic(prev => !prev)}>{isEditingBasic ? "Save" : "Edit"}</button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>LEGAL FIRST NAME</label>
                <input
                  type="text"
                  className={styles.input}
                  defaultValue="Alex"
                  readOnly={!isEditingBasic}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>LEGAL LAST NAME</label>
                <input
                  type="text"
                  className={styles.input}
                  defaultValue="Morgan"
                  readOnly={!isEditingBasic}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>DATE OF BIRTH</label>

                <input
                  type="text"
                  className={styles.input}
                  defaultValue="04/12/1985"
                  readOnly={!isEditingBasic}
                />
              </div>


              <div className={styles.formGroup}>
                <label className={styles.label}>SOCIAL SECURITY NUMBER</label>
                <input
                  type="text"
                  className={styles.input}
                  defaultValue="***-**-****"
                  readOnly={!isEditingBasic}
                />
              </div>

            </div>

            {/* Contact Details */}
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}><Image src={contact} alt="Basic Information" />Contact Details</span>
              <button
                className={styles.editBtn}
                onClick={() => setIsEditingContact(prev => !prev)}
              >
                {isEditingContact ? "Save" : "Edit"}
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.label}>PRIMARY EMAIL</label>
                <input
                  type="email"
                  className={styles.input}
                  defaultValue="mymail@gmail.com"
                  readOnly={!isEditingContact}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>MOBILE PHONE</label>
                <input
                  type="tel"
                  className={styles.input}
                  defaultValue="(555) 123-4567"
                  readOnly={!isEditingContact}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>HOME PHONE</label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="Add home phone"
                  readOnly={!isEditingContact}
                />
              </div>
            </div>

          </div>
        </motion.div>

        <motion.div className={styles.pageHeader} style={{ marginTop: '40px' }} variants={itemVariants}>
          <h2>My medical Records</h2>
          <p>Securely access your history, labs, and visit summaries. Documents are available for download upto 5 years.</p>
        </motion.div>

        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <h3>Visit History</h3>

            <div className={styles.filters}>
              <select>
                <option>All Types</option>
              </select>

              <select>
                <option>Last 6 Months</option>
              </select>
            </div>
          </div>

          <RecordsTable />
        </motion.div>

      </motion.section>
    </motion.div>
  );
}
