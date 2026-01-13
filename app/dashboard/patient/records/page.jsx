import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import RecordsTable from "./components/RecordsTable";
import styles from "./Records.module.css";


export default function RecordsPage() {
  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.main}>
        <Topbar />

        <section className={styles.wrapper}>

          {/* ===== PERSONAL DETAILS HEADER ===== */}
          <div className={styles.pageHeader}>
            <h2>Personal Details</h2>
            <p>Manage your personal information, contact details, and secure identification.</p>
          </div>

          {/* ===== PERSONAL DETAILS CARD ===== */}
          <div className={styles.detailsCard}>
            {/* Left Avatar */}
            <div className={styles.avatarSection}>
              {/* Using a div placeholder if image not available, or img tag */}
              <div className={styles.bigAvatar}></div>
              <h3 className={styles.profileName}>Benjamin Frank</h3>
              <span className={styles.mrn}>MRN: 849-221-009</span>
            </div>

            {/* Right Forms */}
            <div className={styles.formSection}>
              {/* Basic Info */}
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>📋 Basic Information</span>
                <button className={styles.editBtn}>Edit</button>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>LEGAL FIRST NAME</label>
                  <input type="text" className={styles.input} defaultValue="Alex" readOnly />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>LEGAL LAST NAME</label>
                  <input type="text" className={styles.input} defaultValue="Morgan" readOnly />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>DATE OF BIRTH</label>
                  <input type="text" className={styles.input} defaultValue="04/12/1985" readOnly />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>SOCIAL SECURITY NUMBER</label>
                  <input type="text" className={styles.input} defaultValue="***-**-****" readOnly />
                </div>
              </div>

              {/* Contact Details */}
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>📞 Contact Details</span>
                <button className={styles.editBtn}>Edit</button>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.label}>PRIMARY EMAIL</label>
                  <input type="email" className={styles.input} defaultValue="mymail@gmail.com" readOnly />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>MOBILE PHONE</label>
                  <input type="tel" className={styles.input} defaultValue="(555) 123-4567" readOnly />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>HOME PHONE</label>
                  <input type="tel" className={styles.input} placeholder="Add home phone" readOnly />
                </div>
              </div>

            </div>
          </div>

          {/* ===== MEDICAL RECORDS HEADER ===== */}
          <div className={styles.pageHeader} style={{ marginTop: '40px' }}>
            <h2>My medical Records</h2>
            <p>Securely access your history, labs, and visit summaries. Documents are available for download upto 5 years.</p>
          </div>

          {/* ===== VISIT HISTORY TABLE ===== */}
          <div className={styles.card}>
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
          </div>

        </section>
      </main>
    </div>
  );
}
