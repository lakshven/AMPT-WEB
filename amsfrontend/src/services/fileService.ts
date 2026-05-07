// frontend/src/services/fileService.ts

/**
 * Build the full public URL for a file stored in the backend.
 * This is required for View / Download buttons.
 *
 * Example output:
 *   https://your-backend.com/uploads/records/file.pdf
 */

export function getFileUrl(fileName: string, column: string): string {
  if (!fileName) return "";

  // This must match your backend URL (set in .env)
  const apiUrl = process.env.REACT_APP_API_URL || "";
  const base = apiUrl.replace(/\/api\/?$/, "");

  // Build the full URL to the file
  return `${base}/uploads/${column}/${fileName}`;
}
