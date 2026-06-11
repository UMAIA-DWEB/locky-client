import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

const SIZE_LABELS = {
  S: 'Pequeno',
  M: 'Médio',
  L: 'Grande',
};

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

function ErrorView({ title, message }) {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-amber-700"
        >
          Voltar ao dashboard
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-slate-500">{message}</p>
        </div>
      </div>
    </div>
  );
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

  if (error && error.status === 403) {
    return (
      <ErrorView
        title="Acesso restrito"
        message="Esta reserva pertence a outro utilizador."
      />
    );
  }

  if (error && error.status === 404) {
    return (
      <ErrorView
        title="Reserva não encontrada"
        message={`A reserva com ID ${id} não existe ou foi cancelada.`}
      />
    );
  }

  if (error) {
    return (
      <ErrorView
        title="Erro"
        message={`Não foi possível carregar a reserva: ${error.message}`}
      />
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mb-2 h-10 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 h-32 animate-pulse rounded-xl bg-white shadow-sm" />
          <div className="mt-4 h-48 animate-pulse rounded-xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  const locker = reservation.locker || {};
  const station = locker.station || {};
  const sizeLabel = SIZE_LABELS[locker.size] || locker.size;

  const hours = hoursBetween(startTime, endTime);
  const estimatedPrice = locker.pricePerHour && hours > 0
    ? Number((Number(locker.pricePerHour) * hours).toFixed(2))
    : null;

  let validationError = null;
  if (!startTime || !endTime) validationError = 'Preenche o início e o fim.';
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

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link
          to={`/reservations/${id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-amber-700"
        >
          Voltar à reserva
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Editar reserva</h1>
          <p className="mt-1 text-slate-500">
            Só as datas podem ser alteradas. Para mudar de cacifo, cancela esta reserva e cria uma nova.
          </p>
        </header>

        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Reserva #{reservation.id}</p>
          <p className="mt-1 text-base text-slate-900">
            {station.name || 'Estação'}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            Cacifo {locker.number}
            {sizeLabel ? ` - ${sizeLabel}` : ''}
            {locker.pricePerHour ? ` - ${Number(locker.pricePerHour).toFixed(2)} €/h` : ''}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="start" className="mb-1 block text-sm font-medium text-slate-700">
                  Início
                </label>
                <input
                  id="start"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="end" className="mb-1 block text-sm font-medium text-slate-700">
                  Fim
                </label>
                <input
                  id="end"
                  type="datetime-local"
                  min={startTime}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm text-slate-600">
                {hours > 0
                  ? `${hours.toFixed(2).replace(/\.?0+$/, '')} horas a ${Number(locker.pricePerHour).toFixed(2)} €/h`
                  : 'Define o início e fim para veres o novo preço'}
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {estimatedPrice !== null ? `${estimatedPrice.toFixed(2)} €` : '-'}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Preço atual: {Number(reservation.totalPrice).toFixed(2)} €
            </p>
          </div>

          {validationError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {validationError}
            </div>
          )}

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Erro: {submitError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              to={`/reservations/${id}`}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={!!validationError || submitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
