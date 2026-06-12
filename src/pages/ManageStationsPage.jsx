import { useEffect, useState } from 'react';
import { api } from '../api/client';
import ManageNav from '../components/ManageNav';
import StationFormDialog from '../components/StationFormDialog';
import ConfirmDialog from '../components/ConfirmDialog';

function ManageStationsPage() {
  const [stations, setStations] = useState(null);
  const [error, setError] = useState(null);

  const [formMode, setFormMode] = useState(null);
  const [editingStation, setEditingStation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function loadStations() {
    setError(null);
    api.get('/api/stations')
      .then(setStations)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadStations();
  }, []);

  function openCreate() {
    setEditingStation(null);
    setFormMode('create');
  }

  function openEdit(station) {
    setEditingStation(station);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode(null);
    setEditingStation(null);
  }

  // o mesmo handler trata create e edit consoante o formMode
  async function handleFormSubmit(payload) {
    setSubmitting(true);
    try {
      if (formMode === 'edit' && editingStation) {
        await api.put(`/api/stations/${editingStation.id}`, payload);
      } else {
        await api.post('/api/stations', payload);
      }
      loadStations();
      closeForm();
    } finally {
      setSubmitting(false);
    }
  }

  function performDelete() {
    const id = deletingId;
    setDeleting(true);
    api.delete(`/api/stations/${id}`)
      .then(() => {
        setStations((prev) => prev.filter((s) => s.id !== id));
        setDeletingId(null);
      })
      .catch((err) => alert('Erro ao remover: ' + err.message))
      .finally(() => setDeleting(false));
  }

  return (
    <div className="bg-stone-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ManageNav />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-950">Gerir estações</h1>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
          >
            Nova estação
          </button>
        </div>

        {error && (
          <p className="mb-4 text-red-600">Erro: {error}</p>
        )}

        {!stations && !error && (
          <p className="text-neutral-600">A carregar...</p>
        )}

        {stations && stations.length === 0 && (
          <p className="text-neutral-600">Nenhuma estação criada.</p>
        )}

        {stations && stations.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">Cidade</th>
                  <th className="px-4 py-2 text-left">Morada</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((s) => (
                  <tr key={s.id} className="border-t border-neutral-200">
                    <td className="px-4 py-2 text-neutral-500">{s.id}</td>
                    <td className="px-4 py-2 font-medium">{s.name}</td>
                    <td className="px-4 py-2">{s.city}</td>
                    <td className="px-4 py-2 text-neutral-600">{s.address}</td>
                    <td className="px-4 py-2">
                      {s.isActive ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Ativa</span>
                      ) : (
                        <span className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded">Inativa</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100 mr-1"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeletingId(s.id)}
                        className="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-red-50 hover:text-red-600"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StationFormDialog
        open={formMode !== null}
        mode={formMode}
        initialValues={editingStation}
        submitting={submitting}
        onSubmit={handleFormSubmit}
        onCancel={closeForm}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Remover estação?"
        message="A estação será removida permanentemente."
        confirmText={deleting ? 'A remover...' : 'Sim, remover'}
        cancelText="Manter"
        variant="danger"
        onConfirm={performDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

export default ManageStationsPage;
