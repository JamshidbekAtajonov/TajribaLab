export type GraphicsQuality = 'high' | 'light';
const KEY = 'tajribalab-graphics-quality';

export function getGraphicsQuality(): GraphicsQuality {
  if (typeof window === 'undefined') return 'high';
  const stored = window.localStorage.getItem(KEY);
  return stored === 'light' ? 'light' : 'high';
}

export function setGraphicsQuality(value: GraphicsQuality) {
  window.localStorage.setItem(KEY, value);
}
