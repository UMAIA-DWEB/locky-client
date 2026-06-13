// em prod o build define VITE_API_URL="" para usar URLs relativos (Nginx proxy)
// em dev fica undefined no .env -> fallback para a porta local da API
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, opts);

  // 204 No Content
  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // resposta sem JSON - deixar data a null
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Erro ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get:    (path)       => request(path, { method: 'GET' }),
  post:   (path, body) => request(path, { method: 'POST', body }),
  put:    (path, body) => request(path, { method: 'PUT', body }),
  delete: (path)       => request(path, { method: 'DELETE' }),
};

export { API_URL };
