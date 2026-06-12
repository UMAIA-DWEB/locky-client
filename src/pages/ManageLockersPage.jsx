import { useEffect, useState } from 'react';
import { api } from '../api/client';
import ManageNav from '../components/ManageNav';
import LockerFormDialog from '../components/LockerFormDialog';
import ConfirmDialog from '../components/ConfirmDialog';

const SIZE_LABELS = { S: 'Pequeno', M: 'Médio', L: 'Grande' };

function ManageLockersPage() {
  const [lockers, setLockers] = useState(null);
  const [stations, setStations] = useState(null);
  const [error, setError] = useState(null);
  const [filterStationId, setFilterStationId] = useState('');

  const [formMode, setFormMode] = useState(null);
  const [editingLocker, setEditingLocker] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function loadLockers() {
    setError(null);
    api.get('/api/lockers')
      .then(setLockers)
      .catch((err) => setError(err.message));
  }

  function loadStations() {
    api.get('/api/stations')
      .then(setStations)
      .catch(() => {});
  }

  useEffect(() => {
    loadLockers();
    loadStations();
  }, []);

  function openCreate() {
    setEditingLocker(null);
    setFormMode('create');
  }

  function openEdit(locker) {
    setEditingLocker(locker);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode(null);
    setEditingLocker(null);
  }

  async function handleFormSubmit(payload) {
    setSubmitting(true);
    try {
      if (formMode === 'edit' && editingLocker) {
        await api.put(`/api/lockers/${editingLocker.id}`, payload);
      } else {
        await api.post('/api/lockers', payload);
      }
      loadLockers();
      closeForm();
    } finally {
      setSubmitting(false);
    }
  }

  function performDelete() {
    const id = deletingId;
    setDeleting(true);
    api.delete(`/api/lockers/${id}`)
      .then(() => {
        setLockers((prev) => prev.filter((l) => l.id !== id));
        setDeletingId(null);
      })
      .catch((err) => alert('Erro ao remover: ' + err.message))
      .finally(() => setDeleting(false));
  }

  // filtro client-side, evita pedidos extra para a API
  const visibleLockers = lockers && filterStationId
    ? lockers.filter((l) => String(l.stationId) === filterStationId)
    : lockers;

  return (
    <div className="bg-stone-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ManageNav />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-950">Gerir cacifos</h1>
          <button
            onClick={openCreate}
            disabled={!stations}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm disabled:opacity-50"
          >
            Novo cacifo
          </button>
        </div>

        {stations && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <label htmlFor="filter">Filtrar por estação:</label>
            <select
              id="filter"
              value={filterStationId}
              onChange={(e) => setFilterStationId(e.target.value)}
              className="border border-neutral-300 rounded px-2 py-1 focus:border-orange-600 focus:outline-none"
            >
              <option value="">Todas</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>{s.name} - {s.city}</option>
              ))}
            </select>
            {lockers && (
              <span className="text-neutral-500 ml-2">
                {visibleLockers.length} de {lockers.length}
              </span>
            )}
          </div>
        )}

        {error && (
          <p className="mb-4 text-red-600">Erro: {error}</p>
        )}

        {!lockers && !error && (
          <p className="text-neutral-600">A carregar...</p>
        )}

        {lockers && visibleLockers.length === 0 && (
          <p className="text-neutral-600">
            {filterStationId ? 'Esta estação ainda não tem cacifos.' : 'Nenhum cacifo criado.'}
          </p>
        )}

        {lockers && visibleLockers.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Estação</th>
                  <th className="px-4 py-2 text-left">Número</th>
                  <th className="px-4 py-2 text-left">Tamanho</th>
                  <th className="px-4 py-2 text-left">€/hora</th>
                  <th className="px-4 py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visibleLockers.map((l) => {
                  const station = l.station || {};
                  return (
                    <tr key={l.id} className="border-t border-neutral-200">
                      <td className="px-4 py-2 text-neutral-500">{l.id}</td>
                      <td className="px-4 py-2">
                        <div className="font-medium">{station.name || `Estação ${l.stationId}`}</div>
                        {station.city && <div className="text-xs text-neutral-500">{station.city}</div>}
                      </td>
                      <td className="px-4 py-2">{l.number}</td>
                      <td className="px-4 py-2">{SIZE_LABELS[l.size] || l.size}</td>
                      <td className="px-4 py-2 font-medium">{Number(l.pricePerHour).toFixed(2)} €</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => openEdit(l)}
                          className="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100 mr-1"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeletingId(l.id)}
                          className="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-red-50 hover:text-red-600"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LockerFormDialog
        open={formMode !== null}
        mode={formMode}
        initialValues={editingLocker}
        stations={stations}
        submitting={submitting}
        onSubmit={handleFormSubmit}
        onCancel={closeForm}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Remover cacifo?"
        message="O cacifo será removido permanentemente."
        confirmText={deleting ? 'A remover...' : 'Sim, remover'}
        cancelText="Manter"
        variant="danger"
        onConfirm={performDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

export default ManageLockersPage;
