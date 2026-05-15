import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !session.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  try {
    const originalTx = await (prisma as any).financialTransaction.findUnique({
      where: { id },
    });

    if (!originalTx) return new NextResponse("Transaction not found", { status: 404 });
    if (originalTx.isReversed) return new NextResponse("Transaction is already reversed", { status: 400 });

    const reversalTx = await prisma.$transaction(async (tx) => {
      // 1. Create the reversal transaction
      const rt = await (tx as any).financialTransaction.create({
        data: {
          date: new Date(),
          description: `REVERSAL: ${originalTx.description}`,
          amount: originalTx.amount,
          fromAccountId: originalTx.toAccountId, // SWAP
          toAccountId: originalTx.fromAccountId,   // SWAP
          referenceId: originalTx.id,
          referenceType: "REVERSAL",
          createdById: session.user!.id!,
          isReversed: false, // Reversal entries themselves are not reversed
        },
      });

      // 2. Mark original as reversed
      await (tx as any).financialTransaction.update({
        where: { id: originalTx.id },
        data: { 
          isReversed: true,
          reversedTransactionId: rt.id
        },
      });

      // 3. Update account balances
      if (originalTx.toAccountId) { // Swapped From
        await tx.financialAccount.update({
          where: { id: originalTx.toAccountId },
          data: { balance: { decrement: originalTx.amount } },
        });
      }

      if (originalTx.fromAccountId) { // Swapped To
        await tx.financialAccount.update({
          where: { id: originalTx.fromAccountId },
          data: { balance: { increment: originalTx.amount } },
        });
      }

      return rt;
    });

    return NextResponse.json(reversalTx);
  } catch (error) {
    console.error("[TRANSACTION_REVERSE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
