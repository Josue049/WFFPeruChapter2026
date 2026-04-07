import styles from './Toast.module.css';

interface Props {
  icon: string;
  message: string;
  visible: boolean;
}

export function Toast({ icon, message, visible }: Props) {
  return (
    <div className={`${styles.toast} ${visible ? styles.show : ''}`}>
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  );
}
