import { useEffect, useMemo, useState } from 'react';

function msToParts(ms) {
  const total = Math.max(0, ms);
  const seconds = Math.floor(total / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return { days, hours, minutes, seconds: secs, totalMs: total };
}

export function useCountdown(targetIsoOrDate) {
  const target = useMemo(() => (targetIsoOrDate ? new Date(targetIsoOrDate) : null), [targetIsoOrDate]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);

  const remainingMs = target ? target.getTime() - now : 0;
  const parts = msToParts(remainingMs);
  const isEnded = parts.totalMs <= 0;

  return { ...parts, isEnded };
}

