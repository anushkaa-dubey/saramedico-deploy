import styles from "../Records.module.css";

export default function RecordsTable() {
  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>DATE</th>
            <th>VISIT TYPE</th>
            <th>STATUS</th>
            <th>PROVIDER</th>
            <th>ACTION</th>
          </tr>
        </thead>

        <tbody>
          {[
            "01/12/80",
            "08/08/80",
            "12/10/80",
            "12/10/80",
            "12/10/80",
            "12/10/80",
          ].map((date, i) => (
            <tr key={i}>
              <td>{date}</td>
              <td>Check Up</td>
              <td>
                <span className={`${styles.status} ${styles.success}`}>
                  ● Note Finalized
                </span>
              </td>
              <td>Dr. Smith Sara</td>
              <td className={styles.action}>View Note →</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.footer}>
        <span>Showing 1 to 5 of 12 results</span>

        <div className={styles.pagination}>
          <button className={styles.pageBtn}>{"<"}</button>
          <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
          <button className={styles.pageBtn}>2</button>
          <button className={styles.pageBtn}>3</button>
          <button className={styles.pageBtn}>{">"}</button>
        </div>
      </div>
    </>
  );
}
