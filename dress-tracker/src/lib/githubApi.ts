import { useSettingsStore } from '@/store/settingsStore'

type RestOptions = {
  method?: string
  body?: unknown
  signal?: AbortSignal
  accept?: string
}

const DEFAULT_ACCEPT = 'application/vnd.github+json'
const DEFAULT_API_VERSION = '2022-11-28'

function getGithubBase() {
  return import.meta.env.PROD ? 'https://api.github.com' : '/api/github/rest'
}

function buildHeaders(token: string, options: RestOptions) {
  const headers: Record<string, string> = {}

  if (import.meta.env.PROD) {
    headers.accept = options.accept || DEFAULT_ACCEPT
    headers['x-github-api-version'] = DEFAULT_API_VERSION
    if (token) headers.authorization = `Bearer ${token}`
  } else {
    if (token) headers['x-github-token'] = token
    if (options.accept) headers['x-github-accept'] = options.accept
  }

  if (options.body) headers['content-type'] = 'application/json'

  return headers
}

export async function githubRest<T>(path: string, options: RestOptions = {}): Promise<T> {
  const token = useSettingsStore.getState().githubToken

  const res = await fetch(`${getGithubBase()}${path}`, {
    method: options.method || 'GET',
    headers: buildHeaders(token, options),
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

  const res = await fetch(`${getGithubBase()}${path}`, {
    method: options.method || 'GET',
    headers: buildHeaders(token, options),
    signal: options.signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `GitHub request failed: ${res.status}`)
  }

  return await res.text()
}
