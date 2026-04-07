import styles from './DeleteModal.module.css';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({ onConfirm, onCancel }: Props) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>🗑️</div>
        <h2 className={styles.title}>Eliminar artículo</h2>
        <p className={styles.sub}>¿Estás seguro? Esta acción no se puede deshacer.</p>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.ghost}`} onClick={onCancel}>Cancelar</button>
          <button className={`${styles.btn} ${styles.del}`} onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}
