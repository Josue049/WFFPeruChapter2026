import styles from './EmptyState.module.css';

interface Props {
  icon: string;
  title: string;
  sub: string;
}

export function EmptyState({ icon, title, sub }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>{icon}</div>
      <p className={styles.title}>{title}</p>
      <p className={styles.sub}>{sub}</p>
    </div>
  );
}
