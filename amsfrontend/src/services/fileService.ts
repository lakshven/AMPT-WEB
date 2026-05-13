// frontend/src/services/fileService.ts

/**
 * This is required for View / Download buttons.
 *   https://your-backend.com/uploads/records/file.pdf
 */

export function getFileUrl(filePath: string, column: string): string {
  if (!filePath) return "";

  // This must match your backend URL (set in .env)
  const apiUrl = process.env.REACT_APP_API_URL || "";
  const base = apiUrl.replace(/\/api\/?$/, "");

  // Build the full URL to the file
  return `${base}/uploads/${column}/${filePath}`;
}
