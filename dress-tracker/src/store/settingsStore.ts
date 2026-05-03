import { create } from 'zustand'

type RepoRef = { owner: string; repo: string }

type SettingsState = {
  repo: RepoRef
  favorites: RepoRef[]
  githubToken: string
  setRepo: (repo: RepoRef) => void
  addFavorite: (repo: RepoRef) => void
  removeFavorite: (repo: RepoRef) => void
  setGithubToken: (token: string) => void
}

const STORAGE_KEY = 'dress-tracker.settings.v1'

function sameRepo(a: RepoRef, b: RepoRef) {
  return a.owner.toLowerCase() === b.owner.toLowerCase() && a.repo.toLowerCase() === b.repo.toLowerCase()
}

function readInitial(): Pick<SettingsState, 'repo' | 'favorites' | 'githubToken'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) throw new Error('empty')
    const parsed = JSON.parse(raw) as Partial<SettingsState>
    const repo = parsed.repo && parsed.repo.owner && parsed.repo.repo ? parsed.repo : { owner: 'Cute-Dress', repo: 'Dress' }
    const favorites = Array.isArray(parsed.favorites) ? parsed.favorites.filter(Boolean) as RepoRef[] : []
    const githubToken = typeof parsed.githubToken === 'string' ? parsed.githubToken : ''
    return { repo, favorites, githubToken }
  } catch {
    return { repo: { owner: 'Cute-Dress', repo: 'Dress' }, favorites: [{ owner: 'Cute-Dress', repo: 'Dress' }], githubToken: '' }
  }
}

function persist(state: Pick<SettingsState, 'repo' | 'favorites' | 'githubToken'>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initial = readInitial()

  return {
    repo: initial.repo,
    favorites: initial.favorites.length ? initial.favorites : [initial.repo],
    githubToken: initial.githubToken,
    setRepo: (repo) => {
      set({ repo })
      persist({ repo, favorites: get().favorites, githubToken: get().githubToken })
    },
    addFavorite: (repo) => {
      const next = get().favorites.some((r) => sameRepo(r, repo)) ? get().favorites : [repo, ...get().favorites]
      set({ favorites: next })
      persist({ repo: get().repo, favorites: next, githubToken: get().githubToken })
    },
    removeFavorite: (repo) => {
      const next = get().favorites.filter((r) => !sameRepo(r, repo))
      set({ favorites: next })
      persist({ repo: get().repo, favorites: next, githubToken: get().githubToken })
    },
    setGithubToken: (githubToken) => {
      set({ githubToken })
      persist({ repo: get().repo, favorites: get().favorites, githubToken })
    },
  }
})

