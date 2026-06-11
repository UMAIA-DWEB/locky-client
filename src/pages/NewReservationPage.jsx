import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

const SIZE_LABELS = {
  S: 'Pequeno',
  M: 'Médio',
  L: 'Grande',
};

function nowLocalDatetime() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function hoursBetween(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e)) return 0;
  return (e - s) / (1000 * 60 * 60);
}

function NewReservationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialLockerId = searchParams.get('lockerId');

  const [stations, setStations] = useState(null);
  const [stationId, setStationId] = useState('');
  const [stationDetail, setStationDetail] = useState(null);
  const [lockerId, setLockerId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/stations')
      .then(setStations)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!initialLockerId) return;
    api.get(`/api/lockers/${initialLockerId}`)
      .then((locker) => {
        setStationId(String(locker.stationId));
        setLockerId(String(locker.id));
      })
      .catch(() => {});
  }, [initialLockerId]);

  useEffect(() => {
    if (!stationId) {
      setStationDetail(null);
      return;
    }
    api.get(`/api/stations/${stationId}`)
      .then(setStationDetail)
      .catch((err) => setError(err.message));
  }, [stationId]);

  const selectedLocker = useMemo(() => {
    if (!stationDetail || !lockerId) return null;
    return stationDetail.lockers?.find((l) => String(l.id) === lockerId) || null;
  }, [stationDetail, lockerId]);

  const hours = hoursBetween(startTime, endTime);
  const estimatedPrice = selectedLocker && hours > 0
    ? Number((Number(selectedLocker.pricePerHour) * hours).toFixed(2))
    : null;

  let validationError = null;
  if (!stationId) validationError = 'Escolhe uma estação.';
  else if (!lockerId) validationError = 'Escolhe um cacifo.';
  else if (!startTime || !endTime) validationError = 'Preenche o início e o fim.';
  else if (hours <= 0) validationError = 'A data de fim tem que ser depois do início.';

  const showValidation = stationId || lockerId || startTime || endTime;

  function handleStationChange(e) {
    setStationId(e.target.value);
    setLockerId('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validationError) return;

    setSubmitting(true);
    setError(null);

    api.post('/api/reservations', {
      lockerId: Number(lockerId),
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    })
      .then(() => navigate('/dashboard'))
      .catch((err) => {
        setError(err.message);
        setSubmitting(false);
      });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-amber-700"
        >
          Voltar ao dashboard
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Nova reserva</h1>
          <p className="mt-1 text-slate-500">
            Escolhe uma estação, um cacifo e o período em que o queres usar.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div>
              <label htmlFor="station" className="mb-1 block text-sm font-medium text-slate-700">
                Estação
              </label>
              <select
                id="station"
                value={stationId}
                onChange={handleStationChange}
                disabled={!stations}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:opacity-50"
              >
                <option value="">
                  {stations ? 'Escolher estação...' : 'A carregar estações...'}
                </option>
                {stations?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="locker" className="mb-1 block text-sm font-medium text-slate-700">
                Cacifo
              </label>
              <select
                id="locker"
                value={lockerId}
                onChange={(e) => setLockerId(e.target.value)}
                disabled={!stationDetail}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:opacity-50"
              >
                <option value="">
                  {!stationId
                    ? 'Escolhe uma estação primeiro'
                    : stationDetail
                      ? 'Escolher cacifo...'
                      : 'A carregar cacifos...'}
                </option>
                {stationDetail?.lockers?.map((l) => (
                  <option key={l.id} value={l.id}>
                    Cacifo {l.number} - {SIZE_LABELS[l.size] || l.size} - {Number(l.pricePerHour).toFixed(2)} €/h
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="start" className="mb-1 block text-sm font-medium text-slate-700">
                  Início
                </label>
                <input
                  id="start"
                  type="datetime-local"
                  min={nowLocalDatetime()}
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
                  min={startTime || nowLocalDatetime()}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {selectedLocker && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm text-slate-600">
                  {hours > 0
                    ? `${hours.toFixed(2).replace(/\.?0+$/, '')} horas a ${Number(selectedLocker.pricePerHour).toFixed(2)} €/h`
                    : 'Define o início e fim para veres o preço'}
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  {estimatedPrice !== null ? `${estimatedPrice.toFixed(2)} €` : '-'}
                </span>
              </div>
            </div>
          )}

          {validationError && showValidation && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {validationError}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Erro: {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              to="/dashboard"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={!!validationError || submitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'A reservar...' : 'Confirmar reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewReservationPage;
