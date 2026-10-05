export function getScrollMask(scrollTop: number, maxScroll: number) {
  const topFadeOpacity = Math.max(0, Math.min(1, scrollTop / 60));
  const bottomFadeOpacity = Math.max(
    0,
    Math.min(1, (maxScroll - scrollTop) / 60),
  );

  return `linear-gradient(to bottom, rgba(0,0,0,${
    1 - topFadeOpacity
  }) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,${
    1 - bottomFadeOpacity
  }) 100%)`;
}
