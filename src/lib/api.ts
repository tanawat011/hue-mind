export async function apiAction(action: string, payload: any = {}) {
  const res = await fetch('/api/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload })
  });
  return res.json();
}

export function getPlayerId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('playerId');
  if (!id) {
    id = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('playerId', id);
  }
  return id;
}
