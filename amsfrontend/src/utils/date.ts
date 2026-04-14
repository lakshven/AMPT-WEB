export function formatDate(value: any) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}