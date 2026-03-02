import { Request, Response } from "express";
import prisma from "../../prisma/client";
import getStaticOptions from "./dropDownController";

export default async function getAllDropdowns(req: Request, res: Response) {
  try {
    // 1️⃣ Load STATIC dropdowns
    const staticOptions = await (async (): Promise<Record<string, any>> => {
      return new Promise((resolve) => {
        const fakeReq = {} as Request;
        const fakeRes = {
          json: (data: any) => resolve(data)
        } as unknown as Response;

        getStaticOptions(fakeReq, fakeRes);
      });
    })();

    // 2️⃣ Load DYNAMIC dropdowns (only non-deleted values)
    const categories = await prisma.dropdownCategory.findMany({
      include: {
        values: {
          where: { isDeleted: false },
          orderBy: { value: "asc" }
        }
      }
    });

    const dynamicOptions: Record<string, string[]> = {};

    categories.forEach(((cat: { name: string; values: { value: string }[] }
) => {
      dynamicOptions[cat.name] = cat.values.map((v) => v.value);
    }));

    // 3️⃣ Merge STATIC + DYNAMIC
    const finalDropdowns = {
      ...staticOptions,
      ...dynamicOptions
    };

    res.json(finalDropdowns);
  } catch (err) {
    console.error("Unified dropdown fetch error:", err);
    res.status(500).json({ error: "Failed to load dropdowns" });
  }
}