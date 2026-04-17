import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getPrisma } from "../prisma/client";

function prismaClient() { return getPrisma(); }

// Routes that do NOT require a token
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

export async function attachUserContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // ⭐ Skip auth for public routes
  if (PUBLIC_ROUTES.some(route => req.path.startsWith(route))) {
    return next();
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: missing token" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload & {
      id: number;
    };

    // ⭐ Always load fresh user from DB (Prisma-safe)
    const dbUser = await prismaClient().users.findUnique({
      where: { id: decoded.id },
      include: {
        roleRef: true,
        clientGroup: true,
        accountType: true
      }
    });

    if (!dbUser) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // ⭐ Keep roles EXACTLY as stored in DB
    const role = dbUser.role;

    // ⭐ FIX: accountType is derived ONLY from role
    const accountType = role === "single_user" ? "single" : "company";

    req.user = {
      id: dbUser.id,
      username: dbUser.username,
      role,
      roleId: dbUser.role_id,
      permissions: decoded.permissions || [], // frontend expects this
      clientGroupId: dbUser.clientGroupId,
      companyId: dbUser.companyId,
      accountType
    };

    return next();
  } catch (err) {
    console.error("❗ JWT verification failed:", err);
    res.status(401).json({ message: "Invalid token" });
    return;
  }
}
