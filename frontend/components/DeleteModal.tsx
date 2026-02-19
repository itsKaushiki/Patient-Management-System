import styles from './DeleteModal.module.css';

interface DeleteModalProps {
  patientName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  error?: string;
}

export default function DeleteModal({
  patientName,
  onConfirm,
  onCancel,
  loading,
  error,
}: DeleteModalProps) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Delete Patient</h2>
        <p className={styles.message}>
          Are you sure you want to delete <strong>{patientName}</strong>?
          <br />
          This action cannot be undone.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonGroup}>
          <button
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={styles.deleteButton}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

