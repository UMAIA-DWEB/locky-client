import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

const SIZE_LABELS = { S: 'Pequeno', M: 'Médio', L: 'Grande' };

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

  // se a URL trouxer ?lockerId=X, pre-preenche a estacao e o cacifo
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
    if (!stationId) return;

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
  else if (!startTime || !endTime) validationError = 'Preenche as datas.';
  else if (hours <= 0) validationError = 'A data de fim tem que ser depois do início.';

  function handleStationChange(e) {
    const value = e.target.value;
    setStationId(value);
    setLockerId('');
    
    if (!value) {
      setStationDetail(null);
    }
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

  const inputClass = 'w-full border border-neutral-300 rounded px-3 py-2 focus:border-orange-600 focus:outline-none';

  return (
    <div className="bg-stone-100 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/dashboard" className="text-sm text-neutral-600 hover:text-orange-600">
          Voltar ao dashboard
        </Link>

        <h1 className="text-2xl font-bold text-neutral-950 mt-4 mb-1">Nova reserva</h1>
        <p className="text-sm text-neutral-700 mb-6">
          Escolhe uma estação, um cacifo e o período em que o queres usar.
        </p>

        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded p-6">
          <div className="mb-3">
            <label htmlFor="station" className="block text-sm font-medium mb-1">Estação</label>
            <select
              id="station"
              value={stationId}
              onChange={handleStationChange}
              disabled={!stations}
              className={inputClass}
            >
              <option value="">{stations ? 'Escolher estação...' : 'A carregar...'}</option>
              {stations?.map((s) => (
                <option key={s.id} value={s.id}>{s.name} - {s.city}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="locker" className="block text-sm font-medium mb-1">Cacifo</label>
            <select
              id="locker"
              value={lockerId}
              onChange={(e) => setLockerId(e.target.value)}
              disabled={!stationDetail}
              className={inputClass}
            >
              <option value="">
                {!stationId ? 'Escolhe uma estação primeiro' : (stationDetail ? 'Escolher cacifo...' : 'A carregar...')}
              </option>
              {stationDetail?.lockers?.map((l) => (
                <option key={l.id} value={l.id}>
                  Cacifo {l.number} - {SIZE_LABELS[l.size] || l.size} - {Number(l.pricePerHour).toFixed(2)} €/h
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="start" className="block text-sm font-medium mb-1">Início</label>
              <input
                id="start"
                type="datetime-local"
                min={nowLocalDatetime()}
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
                min={startTime || nowLocalDatetime()}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {selectedLocker && hours > 0 && (
            <p className="mb-3 text-sm text-neutral-700">
              {hours.toFixed(2).replace(/\.?0+$/, '')} horas a {Number(selectedLocker.pricePerHour).toFixed(2)} €/h = <strong>{estimatedPrice?.toFixed(2)} €</strong>
            </p>
          )}

          {validationError && (
            <p className="mb-3 text-sm text-orange-700">{validationError}</p>
          )}

          {error && (
            <p className="mb-3 text-sm text-red-600">Erro: {error}</p>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Link
              to="/dashboard"
              className="px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-100"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={!!validationError || submitting}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded disabled:opacity-50"
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
