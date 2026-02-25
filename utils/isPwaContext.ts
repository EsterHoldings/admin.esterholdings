export const isPwaContext = (): boolean => {
  if (!process.client) {
    return false;
  }

  const hasStandaloneDisplayMode = Boolean(
    typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches,
  );
  const isIosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return hasStandaloneDisplayMode || isIosStandalone;
};

export default isPwaContext;
