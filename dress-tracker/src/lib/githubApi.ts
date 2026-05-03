import { useSettingsStore } from '@/store/settingsStore'

type RestOptions = {
  method?: string
  body?: unknown
  signal?: AbortSignal
  accept?: string
}

export async function githubRest<T>(path: string, options: RestOptions = {}): Promise<T> {
  const token = useSettingsStore.getState().githubToken

  const res = await fetch(`/api/github/rest${path}`, {
    method: options.method || 'GET',
    headers: {
      ...(token ? { 'x-github-token': token } : {}),
      ...(options.accept ? { 'x-github-accept': options.accept } : {}),
      'content-type': options.body ? 'application/json' : 'text/plain',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `GitHub request failed: ${res.status}`)
  }

  return (await res.json()) as T
}

export async function githubRestText(path: string, options: RestOptions = {}): Promise<string> {
  const token = useSettingsStore.getState().githubToken

  const res = await fetch(`/api/github/rest${path}`, {
    method: options.method || 'GET',
    headers: {
      ...(token ? { 'x-github-token': token } : {}),
      ...(options.accept ? { 'x-github-accept': options.accept } : {}),
    },
    signal: options.signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `GitHub request failed: ${res.status}`)
  }

  return await res.text()
}
