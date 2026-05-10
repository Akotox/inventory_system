import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { SalesService } from "@/lib/services/sales.service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSaleSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  userId: z.string(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      discount: z.number().min(0).optional(),
    })
  ).min(1),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSFER", "MIXED"]).optional(),
  status: z.enum(["PAID", "INVOICED", "PARTIAL", "VOID"]).optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "0");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "25");
  const status = searchParams.get("status");

  const where = status ? { status: status as any } : {};

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: { customer: true, user: true, saleItems: { include: { product: true } } },
      orderBy: { saleDate: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.sale.count({ where }),
  ]);

  return NextResponse.json({ data: sales, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createSaleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const sale = await SalesService.createSale(parsed.data);
    return NextResponse.json(sale, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
