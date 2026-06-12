function ConfirmDialog({
  open,
  title = 'Confirmar',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmClasses = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-orange-600 hover:bg-orange-700 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-950 bg-opacity-50"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
        {message && <p className="mt-2 text-sm text-neutral-700">{message}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-100"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded ${confirmClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;