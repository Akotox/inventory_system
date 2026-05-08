import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { InventoryService } from "@/lib/services/inventory.service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const adjustSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int(),
  reason: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "0");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50");
  const type = searchParams.get("type");
  const productId = searchParams.get("productId");

  const where = {
    ...(type && { type: type as any }),
    ...(productId && { productId }),
  };

  const [movements, total] = await Promise.all([
    prisma.inventoryMovement.findMany({
      where,
      include: { product: true, createdBy: true },
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.inventoryMovement.count({ where }),
  ]);

  return NextResponse.json({ data: movements, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = adjustSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const movement = await InventoryService.adjustStock(
      parsed.data.productId,
      parsed.data.quantity,
      parsed.data.reason,
      session.user.id!
    );

    return NextResponse.json(movement, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
