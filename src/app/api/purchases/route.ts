import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PurchaseService } from "@/lib/services/purchase.service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createPOSchema = z.object({
  supplierId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantityOrdered: z.number().int().positive(),
      unitCost: z.number().positive(),
    })
  ).min(1),
  notes: z.string().optional(),
  expectedDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: status ? { status: status as any } : {},
    include: { supplier: true, poItems: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(purchaseOrders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (body.action === "auto-reorder") {
      const pos = await PurchaseService.generateReorderPOs(session.user.id!);
      return NextResponse.json(pos, { status: 201 });
    }

    const parsed = createPOSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const po = await PurchaseService.createPO({
      ...parsed.data,
      expectedDate: parsed.data.expectedDate
        ? new Date(parsed.data.expectedDate)
        : undefined,
    });

    return NextResponse.json(po, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
