import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getPrisma } from "../prisma/client";
function prismaClient() { return getPrisma(); }

export async function attachUserContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    req.user = undefined;
    return next();
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

    req.user = {
      id: dbUser.id,
      username: dbUser.username,
      role,
      roleId: dbUser.role_id,
      permissions: decoded.permissions || [], // frontend expects this
      clientGroupId: dbUser.clientGroupId,
      companyId: dbUser.companyId,
      accountType: dbUser.accountType?.value || "company"
    };

    return next();
  } catch (err) {
    console.error("❗ JWT verification failed:", err);
    res.status(401).json({ message: "Invalid token" });
    return;
  }
}