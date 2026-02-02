"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";


const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIconBase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIconBase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const HomeIconBase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ShieldIconBase = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

const DocIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const GraphIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L3.6 18.1" />
  </svg>
);

const RedactionMockup = () => (
  <div className={styles.redactionMockup}>
    <div className={styles.redactionInfo}>
      <div className={styles.redactionBadge}><ShieldIconBase /></div>
      <h3 className={styles.redactionTitle}>Automated PII Redaction</h3>
      <p className={styles.redactionDescription}>Share data securely for research or second opinions. Our AI automatically detects and redacts 18 types of identifiers, ensuring compliance.</p>

      <div className={styles.redactionItems}>
        <div className={styles.redactionItem}>
          <div className={styles.redactionItemLeft}>
            <UserIconBase /> <span>Patient Names</span>
          </div>
          <span className={styles.redactionTag}>REDACTED</span>
        </div>
        <div className={styles.redactionItem}>
          <div className={styles.redactionItemLeft}>
            <CalendarIconBase /> <span>Dates & Birthdays</span>
          </div>
          <span className={styles.redactionTag}>REDACTED</span>
        </div>
        <div className={styles.redactionItem}>
          <div className={styles.redactionItemLeft}>
            <HomeIconBase /> <span>Addresses & Locations</span>
          </div>
          <span className={styles.redactionTag}>REDACTED</span>
        </div>
      </div>
    </div>

    <div className={styles.redactionDoc}>
      <p>
        <span className={styles.redactedBar} style={{ width: '80px' }}></span> presented to the clinic on <span className={styles.redactedBar} style={{ width: '60px' }}></span> from there complaining of severe chest pain.
      </p>
      <p style={{ marginTop: '16px' }}>
        Patient resides at <span className={styles.redactedBar} style={{ width: '120px' }}></span> rather<br />
        Contact number: <span className={styles.redactedBar} style={{ width: '70px' }}></span>
      </p>
      <p style={{ marginTop: '16px' }}>
        SSN: <span className={styles.redactedBar} style={{ width: '90px' }}></span> Referred by Dr. <span className={styles.redactedBar} style={{ width: '100px' }}></span> from <span className={styles.redactedBar} style={{ width: '60px' }}></span>
      </p>
      <p style={{ marginTop: '16px' }}>
        Patient resides at <span className={styles.redactedBar} style={{ width: '120px' }}></span> rather<br />
        Contact number: <span className={styles.redactedBar} style={{ width: '70px' }}></span>
      </p>
    </div>
  </div>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState("Reviewers");
  const [isYearly, setIsYearly] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const testimonials = [
    { name: "Dr. Avinash Sharma", role: "Orthopedics", company: "The application really eliminates all the clutter. Regardless of any hassle and time traffic" },
    { name: "Dr. Sarah Mitchell", role: "Pediatrician", company: "Revolutionized how we handle patient records. The OCR is incredibly accurate." },
    { name: "Dr. James Chen", role: "Cardiology", company: "Finally, clinical AI that actually understands medical context and saves time." },
    { name: "Dr. Elena Rodriguez", role: "General Practice", company: "The automated SOAP notes have saved me hours of charting every week." },
    { name: "Dr. Robert Wilson", role: "Neurology", company: "Seamless integration into our existing workflow. A must-have for modern practice." },
  ];

  const features = {
    Reviewers: [
      {
        id: "ocr",
        title: "Intelligent OCR & Data Extraction",
        description: "Transform messy faxes and PDFs into searchable, structured data instantly. Our AI identifies key medical entities, lab results, and patient demographics, populating your database automatically with 99% accuracy.",
        items: ["Handles handwritten doctor notes", "Smart categorization of document types", "Instant searchability across millions of pages"],
        details: [
          "Advanced handwriting recognition for clinician notes",
          "Automated table extraction for lab results & vitals",
          "ICD-10 Mapping for instant diagnostic coding",
          "Multi-format support: Fax, physical scans, and PDFs"
        ],

        icon: <DocIcon />,
        image: "/landing%20page%20images/intelligentOCR.jpg",
        reverse: false
      },
      {
        id: "chronology",
        title: "Visual Patient Chronology",
        description: "Stop scrolling through hundreds of pages. Our Timeline View aggregates every encounter, lab result, and prescription into an interactive visual history, allowing reviewers to grasp complex cases in seconds.",
        items: ["60% faster chart review time", "Zero missed critical events", "Integrated lab trends"],
        details: [
          "Event Correlation across multiple encounters",
          "Visual Timelines of patient healthcare journeys",
          "Automated Medication Reconciliation detection",
          "Smart Filtering by specialty or date range"
        ],

        icon: <GraphIcon />,
        image: "/landing%20page%20images/visualPatient.jpg",
        reverse: true
      },
      {
        id: "redaction",
        title: "Automated PII Redaction",
        description: "Share data securely for research or second opinions. Our AI automatically detects and redacts 18 types of identifiers, ensuring compliance before documents ever leave your secure environment.",
        items: [
          { label: "Patient Names", icon: <UserIconBase /> },
          { label: "Dates & Birthdays", icon: <CalendarIconBase /> },
          { label: "Addresses & Locations", icon: <HomeIconBase /> }
        ],
        details: [
          "18 HIPAA-compliant Identifiers automatically detected",
          "Contextual Anonymization maintaining medical logic",
          "Batch Processing for large document scales",
          "Audit Logging & Full Redaction Certificates"
        ],

        icon: <PlusIcon />,
        image: "/landing%20page%20images/automate_PII.jpg",
        reverse: false,
        isPII: true
      }
    ],
    Clinicians: [
      {
        id: "redaction-clinician",
        title: "Automated PII Redaction",
        description: "Share data securely for research or second opinions. Our AI automatically detects and redacts 18 types of identifiers, ensuring compliance before documents ever leave your secure environment.",
        items: [
          { label: "Patient Names", icon: <UserIconBase /> },
          { label: "Dates & Birthdays", icon: <CalendarIconBase /> },
          { label: "Addresses & Locations", icon: <HomeIconBase /> }
        ],
        icon: <PlusIcon />,
        image: "/landing%20page%20images/automate_PII.jpg",
        reverse: false,
        isPII: true
      }
    ]
  };

  return (
    <main className={styles.main}>
      {/* Navbar */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ""}`}>
        <div className={styles.navbarContainer}>
          <Link href="/" className={styles.logo}>
            <Image src="/logo-icon.svg" alt="SaraMedico" width={64} height={64} className={styles.logoIcon} />
          </Link>

          <div className={styles.navLinks}>
            <a href="#home" className={styles.navLink}>Home</a>
            <a href="#features" className={styles.navLink}>Product & Features</a>
            <a href="#use-cases" className={styles.navLink}>Use Cases</a>
            <a href="#pricing" className={styles.navLink}>Pricing</a>
            <a href="#security" className={styles.navLink}>Security</a>
          </div>

          <div className={styles.navActions}>
            <Link href="/auth/signup" className={styles.getStartedBtn}>
              Get SaraMedico for free
            </Link>
          </div>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={isMobileMenuOpen ? "M18 6L6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={styles.mobileMenu}
            >
              <Link href="#home" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link href="#features" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Product & Features</Link>
              <Link href="#use-cases" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Use Cases</Link>
              <Link href="#pricing" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
              <Link href="#security" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Security</Link>
              <Link href="/auth/signup" className={styles.mobileGetStartedBtn} onClick={() => setIsMobileMenuOpen(false)}>
                Get SaraMedico for free
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.badge}
          >
            <span className={styles.badgeDot}></span>
            For Medical Practitioners
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.heroTitle}
          >
            The Operating System for <br />
            <span className={styles.heroTitleHighlight}>Modern Medical</span> Practice.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.heroSubtitle}
          >
            Clinical documentation was just the beginning. Get insights from patient records in seconds. SaraMedico&apos;s AI provides customizable reports from any clinical data across your practice, not just your own.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={styles.heroActions}
          >
            <Link href="/auth/signup" className={styles.primaryBtn}>
              Start Free 10-Day Trial
            </Link>
            <Link href="#pricing" className={styles.secondaryBtn}>
              View Pricing
            </Link>
          </motion.div>
        </div>

        {/* Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className={styles.tickerContainer}
        >
          <div className={styles.tickerTrack}>
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.avatar}></div>
                <div className={styles.testimonialInfo}>
                  <h4>{t.name}</h4>
                  <p>{t.role}</p>
                  <p style={{ marginTop: '4px', fontSize: '11px', lineHeight: '1.2' }}>&quot;{t.company}&quot;</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Problems Section */}
      <section id="use-cases" className={styles.problemsSection}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
          style={{ textAlign: 'center' }}
        >
          <h2 className={styles.sectionTitle}>Stop Struggling. Start <span className={styles.sectionTitleHighlight}>Healing.</span></h2>
          <p className={styles.sectionSubtitle}>We understand the challenges modern healthcare professionals face. Here&apos;s how we help.</p>
        </motion.div>

        <div className={styles.problemGrid}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className={styles.problemCard}
          >
            <div className={styles.problemIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <span className={`${styles.cardLabel} ${styles.problemLabel}`}>Problem</span>
            <h3 className={styles.cardTitle}>Drowning in Paperwork?</h3>
            <div className={styles.dividerLine}></div>
            <div className={styles.solutionIcon}>
              <CheckIcon />
            </div>
            <span className={`${styles.cardLabel} ${styles.solutionLabel}`}>Solution</span>
            <h3 className={styles.cardTitle}>Upload 500 pages, get a summary in seconds.</h3>
            <p className={styles.cardDescription}>Our OCR technology extracts and organizes patient data instantly</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className={styles.problemCard}
          >
            <div className={styles.problemIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className={`${styles.cardLabel} ${styles.problemLabel}`}>Problem</span>
            <h3 className={styles.cardTitle}>Late Nights Charting?</h3>
            <div className={styles.dividerLine}></div>
            <div className={styles.solutionIcon}>
              <CheckIcon />
            </div>
            <span className={`${styles.cardLabel} ${styles.solutionLabel}`}>Solution</span>
            <h3 className={styles.cardTitle}>Record your visit, let AI write the SOAP note.</h3>
            <p className={styles.cardDescription}>Focus on patients while AI handles documentation in real-time</p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.featuresSection}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
          style={{ textAlign: 'center' }}
        >
          <h2 className={styles.sectionTitle}>Features & Solutions</h2>
          <p className={styles.sectionSubtitle}>Powerful tools designed specifically for your role in healthcare</p>
        </motion.div>

        <div className={styles.featureTabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === "Reviewers" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("Reviewers")}
          >
            For Reviewers
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "Clinicians" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("Clinicians")}
          >
            For Clinicians
          </button>
        </div>

        <div className={styles.featuresList}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {features[activeTab as keyof typeof features].map((f) =>
                f.isPII ? (
                  <div key={f.id} className={styles.featureGridPII}>
                    <motion.div
                      initial={{ opacity: 0, x: -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className={styles.featureContentPII}
                    >
                      <div className={styles.redactionBadge} style={{ marginBottom: '24px' }}><ShieldIconBase /></div>
                      <h2 className={styles.sectionTitle}>{f.title}</h2>
                      <p className={styles.cardDescription} style={{ fontSize: '18px', margin: '24px 0' }}>{f.description}</p>
                      <div className={styles.redactionItems}>
                        {(f.items as any[]).map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * idx }}
                            className={styles.redactionItem}
                          >
                            <div className={styles.redactionItemLeft}>
                              {item.icon} <span>{item.label}</span>
                            </div>
                            <span className={styles.redactionTag}>REDACTED</span>
                          </motion.div>
                        ))}
                      </div>
                      <div className={styles.dropdownContainer}>
                        <div
                          className={styles.learnMore}
                          style={{ marginTop: '32px', cursor: 'pointer' }}
                          onClick={() => setOpenDropdown(openDropdown === f.id ? null : f.id)}
                        >
                          Learn about PII engine
                          <motion.span animate={{ rotate: openDropdown === f.id ? 90 : 0 }}>
                            <ArrowRight />
                          </motion.span>
                        </div>

                        <AnimatePresence>
                          {openDropdown === f.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              className={styles.dropdownContent}
                            >
                              {f.details?.map((detail, idx) => (
                                <div key={idx} className={styles.dropdownItem}>
                                  <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
                                    <CheckIcon />
                                  </div>
                                  <span>{detail}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className={styles.featureImagePII}
                    >
                      <div className={styles.redactionDoc} style={{ minHeight: '380px' }}>
                        <p>
                          <span className={styles.redactedBar} style={{ width: '80px' }}></span> presented to the clinic on <span className={styles.redactedBar} style={{ width: '60px' }}></span> from there complaining of severe chest pain.
                        </p>
                        <p style={{ marginTop: '24px' }}>
                          Patient resides at <span className={styles.redactedBar} style={{ width: '120px' }}></span> rather<br />
                          Contact number: <span className={styles.redactedBar} style={{ width: '70px' }}></span>
                        </p>
                        <p style={{ marginTop: '24px' }}>
                          SSN: <span className={styles.redactedBar} style={{ width: '90px' }}></span> Referred by Dr. <span className={styles.redactedBar} style={{ width: '100px' }}></span> from <span className={styles.redactedBar} style={{ width: '60px' }}></span>
                        </p>
                        <p style={{ marginTop: '24px' }}>
                          Patient resides at <span className={styles.redactedBar} style={{ width: '120px' }}></span> rather<br />
                          Contact number: <span className={styles.redactedBar} style={{ width: '70px' }}></span>
                        </p>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div key={f.id} className={`${styles.featureDetail} ${f.reverse ? styles.featureDetailReverse : ""}`}>
                    <motion.div
                      initial={{ opacity: 0, x: f.reverse ? 40 : -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className={styles.featureContent}
                    >
                      <div className={styles.featureIcon}>{f.icon}</div>
                      <h2 className={styles.sectionTitle}>{f.title}</h2>
                      <p className={styles.cardDescription} style={{ fontSize: '18px', margin: '24px 0' }}>{f.description}</p>
                      <ul className={styles.featureList}>
                        {(f.items as string[]).map((item, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * idx }}
                            className={styles.featureListItem}
                          >
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                      <div className={styles.dropdownContainer}>
                        <div
                          className={styles.learnMore}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setOpenDropdown(openDropdown === f.id ? null : f.id)}
                        >
                          Learn about {f.title} <ArrowRight />
                        </div>

                        <AnimatePresence>
                          {openDropdown === f.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              className={styles.dropdownContent}
                            >
                              {f.details?.map((detail, idx) => (
                                <div key={idx} className={styles.dropdownItem}>
                                  <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
                                    <CheckIcon />
                                  </div>
                                  <span>{detail}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: f.reverse ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className={styles.featureImage}
                    >
                      <Image
                        src={f.image}
                        alt={f.title}
                        width={600}
                        height={400}
                        style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                      />
                    </motion.div>
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={styles.pricingSection}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
          style={{ textAlign: 'center' }}
        >
          <h2 className={styles.sectionTitle}>Transparent Pricing for Modern Healthcare</h2>
          <p className={styles.sectionSubtitle}>Powerful tools designed specifically for your role in healthcare</p>
        </motion.div>

        <div className={styles.pricingToggle}>
          <span className={`${styles.toggleLabel} ${!isYearly ? styles.toggleLabelActive : ""}`} onClick={() => setIsYearly(false)} style={{ cursor: 'pointer' }}>Bill Monthly</span>
          <div className={styles.toggleSwitch} onClick={() => setIsYearly(!isYearly)}>
            <div className={`${styles.toggleHandle} ${isYearly ? styles.toggleHandleActive : ""}`}></div>
          </div>
          <span className={`${styles.toggleLabel} ${isYearly ? styles.toggleLabelActive : ""}`} onClick={() => setIsYearly(true)} style={{ cursor: 'pointer' }}>Bill Yearly</span>
          <span className={styles.saveBadge}>SAVE 20%</span>
        </div>

        <div className={styles.pricingGrid}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.pricingCard}
          >
            <h3 className={styles.planName}>Standard</h3>
            <p className={styles.planDescription}>Essential tools for solo practitioners.</p>
            <div className={styles.planPrice}>$0<span>/mo</span></div>
            <Link href="/auth/signup" className={styles.planBtnSecondary} style={{ marginBottom: '32px' }}>Start Free</Link>
            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em', color: '#64748b' }}>Features</h4>
            <ul className={styles.planFeatures}>
              <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className={styles.planFeature}><CheckIcon /> Solo notes & dictation</motion.li>
              <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className={styles.planFeature}><CheckIcon /> Basic PDF Analysis (5/mo)</motion.li>
              <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className={styles.planFeature}><CheckIcon /> Community Support</motion.li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={styles.pricingCard}
          >
            <h3 className={styles.planName}>Premium</h3>
            <p className={styles.planDescription}>Advanced AI for growth clinics.</p>
            <div className={styles.planPrice}>${isYearly ? "39" : "49"}<span>/mo</span></div>
            <Link href="/auth/signup" className={styles.planBtnPrimary} style={{ marginBottom: '32px' }}>Contact Sales</Link>
            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em', color: '#64748b' }}>Everything in Standard, Plus</h4>
            <ul className={styles.planFeatures}>
              <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className={styles.planFeature}><CheckIcon /> Unlimited Audio Recording</motion.li>
              <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className={styles.planFeature}><CheckIcon /> Advanced AI Diagnostics</motion.li>
              <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className={styles.planFeature}><CheckIcon /> Priority Support</motion.li>
              <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className={styles.planFeature}><CheckIcon /> BAA Included</motion.li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={styles.pricingCard}
          >
            <h3 className={styles.planName}>Clinic Team</h3>
            <p className={styles.planDescription}>Collaboration for medical teams.</p>
            <div className={styles.planPrice}>$129<span>/seat/mo</span></div>
            <Link href="/auth/signup" className={styles.planBtnSecondary} style={{ marginBottom: '32px' }}>Contact Sales</Link>
            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em', color: '#64748b' }}>Everything in Premium, Plus</h4>
            <ul className={styles.planFeatures}>
              <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className={styles.planFeature}><CheckIcon /> Centralized Billing</motion.li>
              <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className={styles.planFeature}><CheckIcon /> Team Collaboration & Sharing</motion.li>
              <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className={styles.planFeature}><CheckIcon /> Admin Dashboard</motion.li>
              <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className={styles.planFeature}><CheckIcon /> Dedicated Account Manager</motion.li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className={styles.comparisonSection}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
          style={{ textAlign: 'center' }}
        >
          <h2 className={styles.sectionTitle}>Feature Comparison</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={styles.comparisonCard}
        >
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Features</th>
                <th>Standard</th>
                <th>Premium</th>
                <th>Clinic Team</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.categoryRow}>
                <td colSpan={4}>Core AI Features</td>
              </tr>
              <tr>
                <td className={styles.featureName}>PDF Analysis</td>
                <td>5 /month</td>
                <td>Unlimited</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td className={styles.featureName}>Live Audio Recording</td>
                <td>30 mins/Session</td>
                <td>Unlimited</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td className={styles.featureName}>Note Generation</td>
                <td className={styles.checkIconGreen}><CheckIcon /></td>
                <td className={styles.checkIconGreen}><CheckIcon /></td>
                <td className={styles.checkIconGreen}><CheckIcon /></td>
              </tr>
              <tr className={styles.categoryRow}>
                <td colSpan={4}>Collaboration & Admin</td>
              </tr>
              <tr>
                <td className={styles.featureName}>Team Seats</td>
                <td>-</td>
                <td>-</td>
                <td>Custom</td>
              </tr>
              <tr>
                <td className={styles.featureName}>Centralized Billing</td>
                <td>-</td>
                <td>-</td>
                <td className={styles.checkIconGreen}><CheckIcon /></td>
              </tr>
              <tr>
                <td className={styles.featureName}>Admin Dashboard</td>
                <td>-</td>
                <td>-</td>
                <td className={styles.checkIconGreen}><CheckIcon /></td>
              </tr>
              <tr className={styles.categoryRow}>
                <td colSpan={4}>Security & Support</td>
              </tr>
              <tr>
                <td className={styles.featureName}>HIPAA</td>
                <td className={styles.checkIconGreen}><CheckIcon /></td>
                <td className={styles.checkIconGreen}><CheckIcon /></td>
                <td className={styles.checkIconGreen}><CheckIcon /></td>
              </tr>
              <tr>
                <td className={styles.featureName}>Support Level</td>
                <td>Community</td>
                <td>Priority Email</td>
                <td>Dedicated Manager</td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      </section>

      <section id="security" className={styles.faqSection}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
          style={{ textAlign: 'center' }}
        >
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        </motion.div>
        <div className={styles.faqGrid}>
          {[1, 2, 3, 4].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={styles.faqItem}
            >
              {i === 0 && (
                <>
                  <span className={styles.faqQuestion}>Is my data Secure?</span>
                  <p className={styles.faqAnswer}>Yes, Saramedico is fully HIPAA compliant. We sign a BAA (Business Associate Agreement) for all Premium and Clinic team plans to ensure your practice is covered.</p>
                </>
              )}
              {i === 1 && (
                <>
                  <span className={styles.faqQuestion}>Can I Switch plans later?</span>
                  <p className={styles.faqAnswer}>Absolutely. You can upgrade or downgrade your plan at any time from your account dashboard. Changes take effect at the start of the next billing cycle.</p>
                </>
              )}
              {i === 2 && (
                <>
                  <span className={styles.faqQuestion}>What payment methods do you accept?</span>
                  <p className={styles.faqAnswer}>We accept all major credit cards including Visa, Mastercard, and American Express. For Clinic Team plans, we also support invoice billing.</p>
                </>
              )}
              {i === 3 && (
                <>
                  <span className={styles.faqQuestion}>Do you offer a free trial for Premium?</span>
                  <p className={styles.faqAnswer}>We offer a 14-Day free trial for the Premium plan so you can experience our advanced AI diagnostics risk-free.</p>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Merged Footer Section */}
      <footer className={styles.mergedFooter}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.ctaContainer}
        >
          <div className={styles.ctaTextContent}>
            <h2 className={styles.ctaTitle}>Need a custom enterprise solution?</h2>
            <p className={styles.ctaSubtitle}>For larger hospital networks requiring custom integrations, on-premise deployment, or volume discounts.</p>
          </div>
          <Link href="#" className={styles.ctaBtn}>Contact Sales Team</Link>
        </motion.div>

        <div className={styles.footerContainer}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={styles.footerInfo}
          >
            <Link href="/" className={styles.logo} style={{ color: 'white' }}>
              <Image src="/logo-icon.svg" alt="SaraMedico" width={64} height={64} />
            </Link>
            <p>The operating system for modern medical practice.</p>
            <div className={styles.socials}>
              <Link href="#" className={styles.socialLink}>FB</Link>
              <Link href="#" className={styles.socialLink}>TW</Link>
              <Link href="#" className={styles.socialLink}>LN</Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={styles.footerColumn}
          >
            <h5>Product</h5>
            <ul className={styles.footerLinks}>
              <li><Link href="#">Features</Link></li>
              <li><Link href="#">Pricing</Link></li>
              <li><Link href="#">Security</Link></li>
              <li><Link href="#">Integrations</Link></li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={styles.footerColumn}
          >
            <h5>Company</h5>
            <ul className={styles.footerLinks}>
              <li><Link href="#">About Us</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Blog</Link></li>
              <li><Link href="#">Press Kit</Link></li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={styles.footerColumn}
          >
            <h5>Resources</h5>
            <ul className={styles.footerLinks}>
              <li><Link href="#">FAQ</Link></li>
              <li><Link href="#">Documentation</Link></li>
              <li><Link href="#">API</Link></li>
              <li><Link href="#">Status</Link></li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={styles.footerColumn}
          >
            <h5>Legal</h5>
            <ul className={styles.footerLinks}>
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Service</Link></li>
              <li><Link href="#">BAA Request</Link></li>
              <li><Link href="#">Cookie Policy</Link></li>
            </ul>
          </motion.div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2025 SaraMedico, Inc. All rights reserved.</p>
          <p>Built with care for healthcare professionals everywhere.</p>
        </div>
      </footer>
    </main>
  );
}
