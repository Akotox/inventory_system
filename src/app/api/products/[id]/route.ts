import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  costPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
  reorderQuantity: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, supplier: true },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (!["ADMIN", "MANAGER"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Soft delete — deactivate instead of hard delete
  const product = await prisma.product.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json(product);
}
