import{ Request, Response } from "express";
import bcrypt from "bcrypt";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const username = email.toLowerCase();

    // ⭐ 1. Get the "system" account type
    const systemType = await prismaClient().accountTypeOption.findUnique({
      where: { value: "system" }
    });

    if (!systemType) {
      return res.status(400).json({
        success: false,
        message: "Account type 'system' not found. Please add it first."
      });
    }

    // ⭐ 2. Get the app_admin role
    const appAdminRole = await prismaClient().role.findUnique({
      where: { name: "app_admin" }
    });

    if (!appAdminRole) {
      return res.status(400).json({
        success: false,
        message: "Role 'app_admin' not found. Please seed it first."
      });
    }

    // ⭐ 3. Create admin user
    const admin = await prismaClient().users.create({
      data: {
        firstname,
        lastname,
        email: email.toLowerCase(),
        username,
        password: hashed,

        // ⭐ Correct role
        role: "app_admin",
        role_id: appAdminRole.id,

        // ⭐ Correct account type
        accountTypeId: systemType.id,

        // ⭐ Admins are not tied to company or group
        companyId: null,
        clientGroupId: null,

        disabled: false
      }
    });

    res.json({ success: true, admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create admin" });
  }
};