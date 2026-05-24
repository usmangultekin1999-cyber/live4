export async function fetchMatches({ signal } = {}) {
  const response = await fetch('/api/matches', {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    },
    cache: 'no-store',
    signal
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || 'Maç listesi alınamadı.');
  }

  return payload;
}
