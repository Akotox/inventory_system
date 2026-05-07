import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { SalesService } from "@/lib/services/sales.service";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sale = await prisma.sale.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      user: true,
      saleItems: { include: { product: true } },
    },
  });

  if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sale);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.action === "void") {
    try {
      const sale = await SalesService.voidSale(params.id, session.user.id!);
      return NextResponse.json(sale);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
