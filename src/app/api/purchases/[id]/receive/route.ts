import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PurchaseService } from "@/lib/services/purchase.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const receiveSchema = z.object({
  items: z.array(
    z.object({
      poItemId: z.string().uuid(),
      productId: z.string().uuid(),
      quantityReceived: z.number().int().positive(),
    })
  ).min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = receiveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const po = await PurchaseService.receiveItems(
      id,
      parsed.data.items,
      session.user.id!
    );

    return NextResponse.json(po);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
