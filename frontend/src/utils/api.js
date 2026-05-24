import { auth } from '../firebase/config'

const BASE = import.meta.env.VITE_API_URL || '/api'

async function authHeaders(json = false) {
  const user  = auth.currentUser
  const token = user ? await user.getIdToken() : null
  return {
    ...(json  ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` }  : {}),
  }
}

async function handle(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const apiGet    = async (path)        => handle(await fetch(`${BASE}${path}`, { headers: await authHeaders() }))
export const apiPost   = async (path, body)  => handle(await fetch(`${BASE}${path}`, { method: 'POST',   headers: await authHeaders(true), body: JSON.stringify(body) }))
export const apiPut    = async (path, body)  => handle(await fetch(`${BASE}${path}`, { method: 'PUT',    headers: await authHeaders(true), body: JSON.stringify(body) }))
export const apiDelete = async (path)        => handle(await fetch(`${BASE}${path}`, { method: 'DELETE', headers: await authHeaders() }))
