// API base URL loaded from environment variable (set in .env)
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

async function request(method, path, body, headers = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (netErr) {
    console.error(`Network fetch failed for ${path}:`, netErr)
    throw { error: 'Unable to reach backend server. Please verify backend is running on port 4000.' }
  }

  const text = await res.text()
  let data
  try { 
    data = text ? JSON.parse(text) : {} 
  } catch { 
    data = { error: text } 
  }

  if (res.status === 401) {
    // Stale or invalid token detected
    console.warn(`401 Unauthorized on ${path}. Clearing expired authentication session.`)
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    window.dispatchEvent(new CustomEvent('auth:expired', { detail: data }))
  }

  if (!res.ok) throw data
  return data
}

export const api = {
  get:  (path)       => request('GET',    path),
  post: (path, body) => request('POST',   path, body),
  authed: (token) => ({
    get:    (path)       => request('GET',    path, undefined, { Authorization: `Bearer ${token}` }),
    post:   (path, body) => request('POST',   path, body,      { Authorization: `Bearer ${token}` }),
    put:    (path, body) => request('PUT',    path, body,      { Authorization: `Bearer ${token}` }),
    delete: (path)       => request('DELETE', path, undefined, { Authorization: `Bearer ${token}` }),
  })
}
