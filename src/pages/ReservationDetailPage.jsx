import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';

const SIZE_LABELS = {
  S: 'Pequeno',
  M: 'Médio',
  L: 'Grande',
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setReservation(null);
    setError(null);
    api.get(`/api/reservations/${id}`)
      .then(setReservation)
      .catch((err) => setError(err));
  }, [id]);

  function performCancel() {
    setShowConfirm(false);
    setCanceling(true);
    api.delete(`/api/reservations/${id}`)
      .then(() => navigate('/dashboard'))
      .catch((err) => {
        alert('Erro ao cancelar: ' + err.message);
        setCanceling(false);
      });
  }

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
          <div className="mb-1 h-4 w-1/4 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 h-64 animate-pulse rounded-xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  const locker = reservation.locker || {};
  const station = locker.station || {};
  const sizeLabel = SIZE_LABELS[locker.size] || locker.size;

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
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Reserva #{reservation.id}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            {station.name || 'Estação'}
          </h1>
          {station.city && (
            <p className="mt-1 text-sm text-slate-500">{station.city}</p>
          )}
        </header>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="space-y-5">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Cacifo</dt>
              <dd className="mt-1 text-base text-slate-900">
                Cacifo {locker.number}
                {sizeLabel ? ` (${sizeLabel})` : ''}
              </dd>
              {locker.pricePerHour && (
                <dd className="mt-0.5 text-sm text-slate-500">
                  {Number(locker.pricePerHour).toFixed(2)} €/hora
                </dd>
              )}
            </div>

            {station.address && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Morada</dt>
                <dd className="mt-1 text-base text-slate-900">{station.address}</dd>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Início</dt>
                <dd className="mt-1 text-base text-slate-900">{formatDate(reservation.startTime)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Fim</dt>
                <dd className="mt-1 text-base text-slate-900">{formatDate(reservation.endTime)}</dd>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Total</dt>
              <dd className="mt-1 text-3xl font-bold text-slate-900">
                {Number(reservation.totalPrice).toFixed(2)} €
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Link
            to={`/reservations/${id}/edit`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Editar datas
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={canceling}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canceling ? 'A cancelar...' : 'Cancelar reserva'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Cancelar reserva?"
        message="Esta ação não pode ser desfeita. A reserva será removida permanentemente."
        confirmText="Sim, cancelar"
        cancelText="Manter"
        variant="danger"
        onConfirm={performCancel}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

export default ReservationDetailPage;
