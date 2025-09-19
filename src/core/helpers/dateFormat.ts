// helpers
export const isoToDisplay = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
export const displayToIso = (display: string) => {
  if (!display) return "";
  const [d, m, y] = display.split("/");
  return `${y}-${m}-${d}`;
};



