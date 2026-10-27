import styles from "../../pages/campus/Campus.module.css";

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progreso"}
    >
      <div className={`${styles.barFill} ${percent === 100 ? styles.barFillDone : ""}`} style={{ width: `${percent}%` }} />
    </div>
  );
}
