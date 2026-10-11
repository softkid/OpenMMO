const POLL_MS = 5 * 60 * 1000
const RELOAD_GUARD_KEY = 'openmmo.reloadedFor'

async function fetchBuildId(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { buildId?: string }
    return data.buildId ?? null
  } catch {
    return null
  }
}

function reloadOnce(tag: string): void {
  try {
    if (sessionStorage.getItem(RELOAD_GUARD_KEY) === tag) return
    sessionStorage.setItem(RELOAD_GUARD_KEY, tag)
  } catch {
    // storage unavailable; reload anyway
  }
  location.reload()
}

export async function reloadIfOutdated(force = false): Promise<void> {
  if (import.meta.env.DEV) return
  const latest = await fetchBuildId()
  if (latest && latest !== __BUILD_ID__) reloadOnce(latest)
  else if (force) reloadOnce(`mismatch:${__BUILD_ID__}`)
}

export function startVersionPolling(): void {
  if (import.meta.env.DEV) return
  setInterval(() => void reloadIfOutdated(), POLL_MS)
}
