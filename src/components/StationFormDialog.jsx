import { useEffect, useState } from 'react';

const EMPTY = { name: '', city: '', address: '', isActive: true };

function StationFormDialog({ open, mode, initialValues, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState(null);

  // reset dos campos sempre que abre, com valores iniciais quando esta em modo edit
  useEffect(() => {
    if (!open) return;
    if (initialValues) {
      setValues({
        name: initialValues.name || '',
        city: initialValues.city || '',
        address: initialValues.address || '',
        isActive: initialValues.isActive ?? true,
      });
    } else {
      setValues(EMPTY);
    }
    setError(null);
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!values.name.trim() || !values.city.trim() || !values.address.trim()) {
      setError('Nome, cidade e morada são obrigatórios.');
      return;
    }

    try {
      await onSubmit({
        name: values.name.trim(),
        city: values.city.trim(),
        address: values.address.trim(),
        isActive: values.isActive,
      });
    } catch (err) {
      setError(err.message || 'Erro ao guardar.');
    }
  }

  const inputClass = 'w-full border border-neutral-300 rounded px-3 py-2 focus:border-orange-600 focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-950 bg-opacity-50"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold text-neutral-950 mb-4">
          {mode === 'edit' ? 'Editar estação' : 'Nova estação'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="block text-sm font-medium mb-1">Nome</label>
            <input
              id="name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              className={inputClass}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label htmlFor="city" className="block text-sm font-medium mb-1">Cidade</label>
            <input
              id="city"
              name="city"
              type="text"
              value={values.city}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="block text-sm font-medium mb-1">Morada</label>
            <input
              id="address"
              name="address"
              type="text"
              value={values.address}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="mb-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                checked={values.isActive}
                onChange={handleChange}
              />
              Estação ativa
            </label>
          </div>

          {error && (
            <p className="mb-3 text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded disabled:opacity-50"
            >
              {submitting ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StationFormDialog;
