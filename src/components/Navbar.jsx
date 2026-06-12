import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// barra de navegacao fixa no topo, muda consoante o estado de auth
function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // destaca link "Gestao" em qualquer subrota /manage/*
  const isManaging = location.pathname.startsWith('/manage');

  // navega primeiro para evitar ser empurrado para /login pelo PrivateRoute
  async function handleLogout() {
    navigate('/');
    await logout();
  }

  return (
    <nav className="bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold hover:text-orange-600">
          LockyClient
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {loading ? (
            <span className="text-neutral-400">...</span>
          ) : user ? (
            <>
              <Link
                to="/dashboard"
                className={location.pathname === '/dashboard' ? 'text-orange-600' : 'hover:text-orange-600'}
              >
                Dashboard
              </Link>
              <Link
                to="/manage/stations"
                className={isManaging ? 'text-orange-600' : 'hover:text-orange-600'}
              >
                Gestão
              </Link>
              <span className="text-neutral-300">Olá, {user.username}</span>
              <button onClick={handleLogout} className="hover:text-orange-600">
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-orange-600">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
