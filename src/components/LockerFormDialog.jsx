import { useEffect, useState } from 'react';

const EMPTY = { stationId: '', number: '', size: 'S', pricePerHour: '' };

function LockerFormDialog({ open, mode, initialValues, stations, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (initialValues) {
      setValues({
        stationId: String(initialValues.stationId || ''),
        number: initialValues.number || '',
        size: initialValues.size || 'S',
        pricePerHour: initialValues.pricePerHour != null ? String(initialValues.pricePerHour) : '',
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
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!values.stationId) {
      setError('Escolhe uma estação.');
      return;
    }
    if (!values.number.trim()) {
      setError('O número do cacifo é obrigatório.');
      return;
    }
    if (!values.size) {
      setError('O tamanho é obrigatório.');
      return;
    }

    // preco tem que ser numero positivo
    const price = Number(values.pricePerHour);
    if (!Number.isFinite(price) || price <= 0) {
      setError('O preço por hora tem que ser um número positivo.');
      return;
    }

    try {
      await onSubmit({
        stationId: Number(values.stationId),
        number: values.number.trim(),
        size: values.size,
        pricePerHour: price,
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
          {mode === 'edit' ? 'Editar cacifo' : 'Novo cacifo'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="stationId" className="block text-sm font-medium mb-1">Estação</label>
            <select
              id="stationId"
              name="stationId"
              value={values.stationId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Escolher estação...</option>
              {stations?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.city}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="number" className="block text-sm font-medium mb-1">Número</label>
            <input
              id="number"
              name="number"
              type="text"
              value={values.number}
              onChange={handleChange}
              className={inputClass}
              placeholder="ex: 01"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="size" className="block text-sm font-medium mb-1">Tamanho</label>
            <select
              id="size"
              name="size"
              value={values.size}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="S">Pequeno (S)</option>
              <option value="M">Médio (M)</option>
              <option value="L">Grande (L)</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="pricePerHour" className="block text-sm font-medium mb-1">Preço por hora (€)</label>
            <input
              id="pricePerHour"
              name="pricePerHour"
              type="number"
              step="0.01"
              min="0.01"
              value={values.pricePerHour}
              onChange={handleChange}
              className={inputClass}
              placeholder="0.00"
            />
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

export default LockerFormDialog;
