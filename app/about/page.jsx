"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./About.module.css";

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.sectionIcon}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const HeartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.sectionIcon}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const TargetIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.sectionIcon}>
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <Link href="/" className={styles.logo}>
            <Image src="/logo-icon.svg" alt="SaraMedico" width={36} height={36} />
            SaraMedico
          </Link>
          <Link href="/" className={styles.backBtn}>
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.hero}
      >
        <h1 className={styles.heroTitle}>About SaraMedico</h1>
        <p className={styles.heroSubtitle}>
          Pioneering AI-assisted clinical documentation, secure OCR, and decision-support to build the operating system for modern medical practice.
        </p>
      </motion.section>

      {/* Content */}
      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}><TargetIcon /> Who We Are</h2>
          <p className={styles.sectionText}>
            Built by <strong>SaraMedico, Inc.</strong>, an established healthcare technology company, our platform is designed by clinical experts and AI engineers. We are a registered healthcare software provider dedicated to solving one of the most pressing challenges in medicine: physician burnout caused by overwhelming administrative documentation and charting.
          </p>
          <p className={styles.sectionText}>
            We are a verified, legitimate business. Our applications operate primarily out of transparent, audited environments to ensure clinicians receive reliable support that meets stringent industry standards.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}><HeartIcon /> What Our Platform Does</h2>
          <p className={styles.sectionText}>
            SaraMedico is a robust healthcare platform that provides intelligent OCR, visit transcription, and AI-enabled SOAP note generation. Whether managing patient consultations or automating complex chart reviews, our tools extract actionable data instantly—allowing doctors to focus on what matters most: patient care.
          </p>
          <p className={styles.sectionText}>
            Our solution handles handwritten notes, categorizes documents, correlates events across multiple encounters, and offers patient chronologies. All outputs serve as clinical decision support.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}><ShieldIcon /> Trust, Safety & Compliance</h2>
          <p className={styles.sectionText}>
            Healthcare applications handle highly sensitive Protected Health Information (PHI). Confidence in your software is paramount. SaraMedico uses enterprise-grade encryption for data in transit and at rest. Security isn&apos;t just an afterthought—it&apos;s our foundation.
          </p>
          <p className={styles.sectionText}>
            Our AI models automatically detect and redact 18 types of HIPAA-compliant personal identifiers. Furthermore, we never use customer PHI to train shared or public AI models. 
          </p>
          
          <div className={styles.badgeList}>
            <span className={styles.badge}>HIPAA-Aligned Infrastructure</span>
            <span className={`${styles.badge} ${styles.green}`}>BAA Available</span>
            <span className={styles.badge}>End-to-End Encryption</span>
            <span className={styles.badge}>Secure Audit Logging</span>
            <span className={styles.badge}>SOC 2 Preparedness</span>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>© 2025 SaraMedico, Inc. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
            <Link href="/baa" className={styles.footerLink}>BAA</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
