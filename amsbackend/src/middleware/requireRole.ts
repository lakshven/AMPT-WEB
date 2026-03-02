import { Request, Response, NextFunction } from "express";

export function requireRole(...roles: string []) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if ( !req.user || !req.user.role) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let userRole = String(req.user.role).toLowerCase();
     // ⭐ Allow single_user ONLY during first-time setup (no company yet)
    if (userRole === "single_user" && req.user.companyId === null) {
      next();
      return;
    }

    const allowed = roles.map(r => r.toLowerCase());
    
    if (!allowed.includes(userRole)) {
      res.status(403).json({ message: "Forbidden: insufficient Role" , requiredRoles: roles});
      return;
    }
    next();
  };
}