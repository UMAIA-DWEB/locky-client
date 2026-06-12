import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="bg-stone-100 min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-neutral-950">404</h1>
        <p className="text-neutral-700 mt-2">Página não encontrada.</p>
        <Link to="/" className="mt-4 inline-block text-orange-600 hover:underline">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
