import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = true,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center p-2">
        {/* Warning Icon Badge */}
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
            danger
              ? 'bg-danger/10 text-danger border border-danger/20 shadow-soft'
              : 'bg-warning/10 text-warning border border-warning/20 shadow-soft'
          }`}
        >
          {danger ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
        </div>

        {/* Title & Message */}
        <h3 className="font-heading text-lg font-bold text-ink">{title}</h3>
        <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed max-w-[280px]">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex w-full gap-2.5">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            className="flex-1"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
