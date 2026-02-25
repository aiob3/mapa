const ROUTE_DEFENSE_KEY = "mapa.security.route.defense.v1";
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS_IN_WINDOW = 20;
const BLOCK_MS = 5 * 60_000;

interface RouteDefenseState {
  attempts: number[];
  blockedUntil: number;
}

interface RouteDefenseResult {
  blocked: boolean;
  attemptsInWindow: number;
  blockedUntil: number | null;
}

function readState(): RouteDefenseState {
  try {
    const raw = window.sessionStorage.getItem(ROUTE_DEFENSE_KEY);
    if (!raw) {
      return { attempts: [], blockedUntil: 0 };
    }
    const parsed = JSON.parse(raw) as RouteDefenseState;
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts.filter(value => typeof value === "number") : [],
      blockedUntil: typeof parsed.blockedUntil === "number" ? parsed.blockedUntil : 0,
    };
  } catch {
    return { attempts: [], blockedUntil: 0 };
  }
}

function writeState(state: RouteDefenseState): void {
  try {
    window.sessionStorage.setItem(ROUTE_DEFENSE_KEY, JSON.stringify(state));
  } catch {
    // no-op for restricted environments
  }
}

export function registerUnknownRouteAttempt(pathname: string): RouteDefenseResult {
  const now = Date.now();
  const state = readState();

  const attempts = state.attempts.filter(timestamp => now - timestamp <= WINDOW_MS);
  attempts.push(now);

  let blockedUntil = state.blockedUntil;
  const currentlyBlocked = blockedUntil > now;

  if (!currentlyBlocked && attempts.length >= MAX_ATTEMPTS_IN_WINDOW) {
    blockedUntil = now + BLOCK_MS;
    console.warn("[route.defense] temporary block enabled for suspicious route scanning", {
      pathname,
      attemptsInWindow: attempts.length,
      blockedUntil,
    });
  }

  writeState({ attempts, blockedUntil });

  return {
    blocked: blockedUntil > now,
    attemptsInWindow: attempts.length,
    blockedUntil: blockedUntil > now ? blockedUntil : null,
  };
}
