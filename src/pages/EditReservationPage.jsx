import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

const SIZE_LABELS = { S: 'Pequeno', M: 'Médio', L: 'Grande' };

// converte ISO UTC para o formato do input datetime-local (em hora local)
function isoToLocalDatetime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function hoursBetween(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e)) return 0;
  return (e - s) / (1000 * 60 * 60);
}

function EditReservationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    api.get(`/api/reservations/${id}`)
      .then((r) => {
        setReservation(r);
        setStartTime(isoToLocalDatetime(r.startTime));
        setEndTime(isoToLocalDatetime(r.endTime));
      })
      .catch((err) => setError(err));
  }, [id]);

  if (error) {
    return (
      <div className="bg-stone-100 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link to="/dashboard" className="text-sm text-neutral-600 hover:text-orange-600">
            Voltar
          </Link>
          <p className="mt-4 text-red-600">
            {error.status === 403 ? 'Acesso restrito.' : error.status === 404 ? 'Reserva não encontrada.' : `Erro: ${error.message}`}
          </p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="bg-stone-100 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-neutral-600">A carregar...</p>
        </div>
      </div>
    );
  }

  const locker = reservation.locker || {};
  const station = locker.station || {};
  const hours = hoursBetween(startTime, endTime);
  const estimatedPrice = locker.pricePerHour && hours > 0
    ? Number((Number(locker.pricePerHour) * hours).toFixed(2))
    : null;

  let validationError = null;
  if (!startTime || !endTime) validationError = 'Preenche as datas.';
  else if (hours <= 0) validationError = 'A data de fim tem que ser depois do início.';

  function handleSubmit(e) {
    e.preventDefault();
    if (validationError) return;

    setSubmitting(true);
    setSubmitError(null);

    api.put(`/api/reservations/${id}`, {
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    })
      .then(() => navigate(`/reservations/${id}`))
      .catch((err) => {
        setSubmitError(err.message);
        setSubmitting(false);
      });
  }

  const inputClass = 'w-full border border-neutral-300 rounded px-3 py-2 focus:border-orange-600 focus:outline-none';

  return (
    <div className="bg-stone-100 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to={`/reservations/${id}`} className="text-sm text-neutral-600 hover:text-orange-600">
          Voltar à reserva
        </Link>

        <h1 className="text-2xl font-bold text-neutral-950 mt-4 mb-1">Editar reserva</h1>
        <p className="text-sm text-neutral-700 mb-6">
          Só as datas podem ser alteradas.
        </p>

        <div className="mb-4 p-4 bg-white border border-neutral-200 rounded">
          <p className="text-xs text-neutral-500">Reserva #{reservation.id}</p>
          <p className="font-semibold text-neutral-950">{station.name}</p>
          <p className="text-sm text-neutral-700">
            Cacifo {locker.number} - {SIZE_LABELS[locker.size] || locker.size} - {Number(locker.pricePerHour).toFixed(2)} €/h
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="start" className="block text-sm font-medium mb-1">Início</label>
              <input
                id="start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="end" className="block text-sm font-medium mb-1">Fim</label>
              <input
                id="end"
                type="datetime-local"
                min={startTime}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {hours > 0 && (
            <p className="mb-3 text-sm text-neutral-700">
              Novo total: <strong>{estimatedPrice?.toFixed(2)} €</strong>
              <span className="ml-2 text-xs text-neutral-500">
                (atual: {Number(reservation.totalPrice).toFixed(2)} €)
              </span>
            </p>
          )}

          {validationError && (
            <p className="mb-3 text-sm text-orange-700">{validationError}</p>
          )}

          {submitError && (
            <p className="mb-3 text-sm text-red-600">Erro: {submitError}</p>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Link
              to={`/reservations/${id}`}
              className="px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-100"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={!!validationError || submitting}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded disabled:opacity-50"
            >
              {submitting ? 'A guardar...' : 'Guardar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditReservationPage;
