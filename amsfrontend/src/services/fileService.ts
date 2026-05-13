// frontend/src/services/fileService.ts

export function getFileUrl(column: string, fileName: string): string {
  if (!fileName) return "";

  const apiUrl = process.env.REACT_APP_API_URL || "";
  const base = apiUrl.replace(/\/api\/?$/, "");

  return `${base}/uploads/${column}/${fileName}`;
}
