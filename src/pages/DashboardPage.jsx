import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import ConfirmDialog from '../components/ConfirmDialog';

const SIZE_LABELS = {
  S: 'Pequeno',
  M: 'Médio',
  L: 'Grande',
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DashboardPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState(null);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  function loadReservations() {
    setError(null);
    api.get('/api/reservations')
      .then(setReservations)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadReservations();
  }, []);

  function performCancel() {
    const id = confirmingId;
    setConfirmingId(null);
    setCancelingId(id);

    api.delete(`/api/reservations/${id}`)
      .then(() => {
        setReservations((prev) => prev.filter((r) => r.id !== id));
      })
      .catch((err) => {
        alert('Erro ao cancelar: ' + err.message);
      })
      .finally(() => {
        setCancelingId(null);
      });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl">

        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Minhas reservas</h1>
            <p className="mt-1 text-slate-500">
              Bem-vindo de volta, <span className="font-medium text-slate-900">{user.username}</span>.
            </p>
          </div>
          <Link
            to="/reservations/new"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Nova reserva
          </Link>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            Erro ao carregar reservas: {error}
          </div>
        )}

        {!reservations && !error && (
          <ul className="space-y-4">
            {[1, 2, 3].map((i) => (
              <li key={i} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm" />
            ))}
          </ul>
        )}

        {reservations && reservations.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-slate-700">Ainda sem reservas</h2>
            <p className="mt-2 text-sm text-slate-500">
              Explora as estações disponíveis e reserva o teu primeiro cacifo.
            </p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Ver estações
            </Link>
          </div>
        )}

        {reservations && reservations.length > 0 && (
          <ul className="space-y-4">
            {reservations.map((r) => {
              const locker = r.locker || {};
              const station = locker.station || {};
              const sizeLabel = SIZE_LABELS[locker.size] || locker.size;

              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {station.name || 'Estação desconhecida'}
                      </h3>
                      <p className="mt-0.5 text-sm text-slate-500">
                        Cacifo {locker.number}
                        {sizeLabel ? ` - ${sizeLabel}` : ''}
                        {station.city ? ` - ${station.city}` : ''}
                      </p>
                    </div>
                    <span className="rounded-md bg-slate-50 px-3 py-1 text-base font-bold text-slate-900">
                      {Number(r.totalPrice).toFixed(2)} €
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="text-sm text-slate-500">
                      <span className="text-slate-700">{formatDate(r.startTime)}</span>
                      <span className="mx-2 text-slate-400">até</span>
                      <span className="text-slate-700">{formatDate(r.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/reservations/${r.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Ver detalhe
                      </Link>
                      <button
                        onClick={() => setConfirmingId(r.id)}
                        disabled={cancelingId === r.id}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cancelingId === r.id ? 'A cancelar...' : 'Cancelar'}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

      </div>

      <ConfirmDialog
        open={confirmingId !== null}
        title="Cancelar reserva?"
        message="Esta ação não pode ser desfeita. A reserva será removida permanentemente."
        confirmText="Sim, cancelar"
        cancelText="Manter"
        variant="danger"
        onConfirm={performCancel}
        onCancel={() => setConfirmingId(null)}
      />
    </div>
  );
}

export default DashboardPage;
