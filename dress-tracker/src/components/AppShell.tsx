import { NavLink, Outlet } from 'react-router-dom'
import {
  Activity,
  Camera,
  ChevronDown,
  FileClock,
  GitPullRequest,
  Menu,
  Settings,
  Sparkles,
  SunMoon,
  X,
} from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useSettingsStore } from '@/store/settingsStore'
import { IconButton } from '@/components/ui/IconButton'

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function RepoAvatar({ owner, repo }: { owner: string; repo: string }) {
  const seed = `${owner}/${repo}`
  return (
    <div
      className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 shadow-[0_18px_46px_rgba(0,0,0,0.38)]"
      style={{
        backgroundImage: `radial-gradient(18px 18px at 30% 30%, rgba(255,121,183,0.55), transparent 60%), radial-gradient(22px 22px at 85% 55%, rgba(120,210,255,0.45), transparent 60%), radial-gradient(26px 26px at 55% 105%, rgba(255,215,130,0.28), transparent 65%)`,
      }}
      aria-label={seed}
    />
  )
}

export default function AppShell() {
  const { toggleTheme } = useTheme()
  const repo = useSettingsStore((s) => s.repo)
  const favorites = useSettingsStore((s) => s.favorites)
  const setRepo = useSettingsStore((s) => s.setRepo)
  const addFavorite = useSettingsStore((s) => s.addFavorite)

  const [repoInput, setRepoInput] = useState(`${repo.owner}/${repo.repo}`)
  const [open, setOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  const parsed = useMemo(() => {
    const [ownerRaw, repoRaw] = repoInput.split('/')
    const owner = (ownerRaw || '').trim()
    const name = (repoRaw || '').trim()
    return owner && name ? { owner, repo: name } : null
  }, [repoInput])

  return (
    <div className="min-h-screen bg-[radial-gradient(1100px_520px_at_20%_-10%,rgba(255,121,183,0.22),transparent_60%),radial-gradient(980px_520px_at_95%_0%,rgba(120,210,255,0.18),transparent_55%),radial-gradient(1200px_520px_at_55%_120%,rgba(255,215,130,0.10),transparent_65%),linear-gradient(180deg,rgba(14,15,19,0.98),rgba(10,10,13,0.98))] text-zinc-100">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <aside className="hidden w-[290px] shrink-0 lg:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_34px_120px_rgba(0,0,0,0.55)]">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
                <Sparkles className="h-[18px] w-[18px] text-pink-200" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-[15px] tracking-[0.18px]">Dress Tracker</div>
                <div className="mt-0.5 text-xs text-white/60">PR · History · Gallery · Stats</div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="ml-auto grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                aria-label="Toggle theme"
              >
                <SunMoon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <nav className="mt-5 space-y-1">
              <NavItem to="/" icon={<Activity className="h-4 w-4" />} label="Overview" />
              <NavItem to="/prs" icon={<GitPullRequest className="h-4 w-4" />} label="PR Tracker" />
              <NavItem to="/history" icon={<FileClock className="h-4 w-4" />} label="History" />
              <NavItem to="/gallery" icon={<Camera className="h-4 w-4" />} label="Gallery" />
              <NavItem to="/stats" icon={<Activity className="h-4 w-4" />} label="Stats" />
              <NavItem to="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_34px_120px_rgba(0,0,0,0.55)]">
            <header className="relative border-b border-white/10 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="lg:hidden">
                  <IconButton label="Menu" onClick={() => setNavOpen(true)}>
                    <Menu className="h-[18px] w-[18px]" />
                  </IconButton>
                </div>
                <RepoAvatar owner={repo.owner} repo={repo.repo} />
                <div className="min-w-0">
                  <div className="font-display text-[15px] tracking-[0.18px]">
                    {repo.owner} / {repo.repo}
                  </div>
                  <div className="mt-0.5 text-xs text-white/60">默认仓库可用，支持切换多个仓库</div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <div className="hidden lg:block">
                    <IconButton label="Toggle theme" onClick={toggleTheme}>
                      <SunMoon className="h-[18px] w-[18px]" />
                    </IconButton>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
                      onClick={() => setOpen((v) => !v)}
                    >
                      切换仓库
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {open ? (
                      <div className="absolute right-0 z-20 mt-2 w-[360px] rounded-2xl border border-white/10 bg-[#0e0f13]/95 p-3 shadow-[0_34px_120px_rgba(0,0,0,0.65)] backdrop-blur">
                        <div className="text-[11px] text-white/60">格式：owner/repo</div>
                        <div className="mt-2 flex gap-2">
                          <input
                            value={repoInput}
                            onChange={(e) => setRepoInput(e.target.value)}
                            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-pink-200/40"
                            placeholder="Cute-Dress/Dress"
                          />
                          <button
                            type="button"
                            className={classNames(
                              'h-10 shrink-0 rounded-xl border px-3 text-xs transition',
                              parsed
                                ? 'border-pink-200/30 bg-pink-200/10 text-pink-100 hover:bg-pink-200/15'
                                : 'border-white/10 bg-white/5 text-white/40',
                            )}
                            disabled={!parsed}
                            onClick={() => {
                              if (!parsed) return
                              setRepo(parsed)
                              addFavorite(parsed)
                              setOpen(false)
                            }}
                          >
                            应用
                          </button>
                        </div>

                        <div className="mt-3 grid gap-2">
                          <div className="text-[11px] text-white/60">收藏</div>
                          <div className="grid max-h-[220px] gap-1 overflow-auto pr-1">
                            {favorites.map((r) => {
                              const active = r.owner === repo.owner && r.repo === repo.repo
                              return (
                                <button
                                  key={`${r.owner}/${r.repo}`}
                                  type="button"
                                  className={classNames(
                                    'flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs transition',
                                    active
                                      ? 'border-pink-200/30 bg-pink-200/10 text-pink-100'
                                      : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
                                  )}
                                  onClick={() => {
                                    setRepo(r)
                                    setRepoInput(`${r.owner}/${r.repo}`)
                                    setOpen(false)
                                  }}
                                >
                                  <span className="truncate">{r.owner}/{r.repo}</span>
                                  <span className="text-[10px] text-white/45">{active ? '当前' : '切换'}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </header>

            <div className="px-4 py-4 pb-24 lg:px-5 lg:py-5 lg:pb-5">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {navOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur lg:hidden" onClick={() => setNavOpen(false)}>
          <div
            className="h-full w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#0e0f13]/95 p-4 shadow-[0_34px_120px_rgba(0,0,0,0.65)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
                <Sparkles className="h-[18px] w-[18px] text-pink-200" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-[15px] tracking-[0.18px]">Dress Tracker</div>
                <div className="mt-0.5 text-xs text-white/60">Mobile navigation</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <IconButton label="Toggle theme" onClick={toggleTheme}>
                  <SunMoon className="h-[18px] w-[18px]" />
                </IconButton>
                <IconButton label="Close" onClick={() => setNavOpen(false)}>
                  <X className="h-[18px] w-[18px]" />
                </IconButton>
              </div>
            </div>

            <nav className="mt-5 space-y-1">
              <NavItem to="/" icon={<Activity className="h-4 w-4" />} label="Overview" onNavigate={() => setNavOpen(false)} />
              <NavItem to="/prs" icon={<GitPullRequest className="h-4 w-4" />} label="PR Tracker" onNavigate={() => setNavOpen(false)} />
              <NavItem to="/history" icon={<FileClock className="h-4 w-4" />} label="History" onNavigate={() => setNavOpen(false)} />
              <NavItem to="/gallery" icon={<Camera className="h-4 w-4" />} label="Gallery" onNavigate={() => setNavOpen(false)} />
              <NavItem to="/stats" icon={<Activity className="h-4 w-4" />} label="Stats" onNavigate={() => setNavOpen(false)} />
              <NavItem to="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" onNavigate={() => setNavOpen(false)} />
            </nav>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0e0f13]/80 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[680px] items-center justify-between gap-2">
          <BottomNavItem to="/" icon={<Activity className="h-[18px] w-[18px]" />} label="Overview" />
          <BottomNavItem to="/prs" icon={<GitPullRequest className="h-[18px] w-[18px]" />} label="PR" />
          <BottomNavItem to="/history" icon={<FileClock className="h-[18px] w-[18px]" />} label="History" />
          <BottomNavItem to="/gallery" icon={<Camera className="h-[18px] w-[18px]" />} label="Gallery" />
        </div>
      </div>
    </div>
  )
}

function NavItem({
  to,
  icon,
  label,
  onNavigate,
}: {
  to: string
  icon: ReactNode
  label: string
  onNavigate?: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={() => onNavigate?.()}
      className={({ isActive }) =>
        classNames(
          'group flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition',
          isActive ? 'border-pink-200/30 bg-pink-200/10 text-pink-100' : 'border-transparent text-white/75 hover:border-white/10 hover:bg-white/5 hover:text-white',
        )
      }
      end={to === '/'}
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition group-hover:bg-white/10">
        {icon}
      </span>
      <span className="font-medium tracking-[0.1px]">{label}</span>
    </NavLink>
  )
}

function BottomNavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        classNames(
          'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-[11px] transition',
          isActive ? 'border-pink-200/25 bg-pink-200/10 text-pink-100' : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10',
        )
      }
      end={to === '/'}
    >
      {icon}
      <span className="leading-none">{label}</span>
    </NavLink>
  )
}
