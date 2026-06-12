import { NavLink } from 'react-router-dom';

function ManageNav() {
  function getClass({ isActive }) {
    return isActive
      ? 'px-3 py-1 bg-neutral-950 text-white rounded'
      : 'px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-100';
  }

  return (
    <div className="mb-4 flex gap-2 text-sm">
      <NavLink to="/manage/stations" className={getClass}>Estações</NavLink>
      <NavLink to="/manage/lockers" className={getClass}>Cacifos</NavLink>
    </div>
  );
}

export default ManageNav;
