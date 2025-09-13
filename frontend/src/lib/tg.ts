export function getTG() {
  if (typeof window === 'undefined') return null;
  return (window as any).Telegram?.WebApp ?? null;
}

export function readTG() {
  const tg = getTG() as any; // намеренно any, чтобы не падать на редких полях
  return {
    tg,
    platform: tg?.platform ?? 'unknown',
    colorScheme: tg?.colorScheme ?? null,
    isExpanded: !!tg?.isExpanded,
    viewportHeight:
      typeof tg?.viewportHeight === 'number'
        ? tg.viewportHeight
        : (typeof window !== 'undefined' ? window.innerHeight : 0),
    initData: tg?.initData ?? '',
    user: tg?.initDataUnsafe?.user ?? null,
    themeParams: tg?.themeParams ?? tg?.initDataUnsafe?.theme_params ?? {},
  };
}