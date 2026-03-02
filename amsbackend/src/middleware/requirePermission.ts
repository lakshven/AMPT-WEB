import { Request, Response, NextFunction } from "express";


export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.permissions) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
        // Normalize permissions to uppercase for safe comparison
    const userPerms = req.user.permissions.map(p => p.toUpperCase());
    const required = requiredPermissions.map(p => p.toUpperCase());

    // ❗ Check if user has ALL required permissions
    const hasAll = required.every(p => userPerms.includes(p));
if (!hasAll) {
      res.status(403).json({
        message: "Forbidden: missing permission",
        required: requiredPermissions,
      });
      return;
    }
    next();
  };
}