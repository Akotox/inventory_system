import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { date, description, amount, fromAccountId, toAccountId } = body;

    const oldTx = await prisma.financialTransaction.findUnique({
      where: { id: params.id },
    });

    if (!oldTx) return new NextResponse("Transaction not found", { status: 404 });

    const updatedTx = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Reverse old balance changes
      if (oldTx.fromAccountId) {
        await tx.financialAccount.update({
          where: { id: oldTx.fromAccountId },
          data: { balance: { increment: oldTx.amount } },
        });
      }
      if (oldTx.toAccountId) {
        await tx.financialAccount.update({
          where: { id: oldTx.toAccountId },
          data: { balance: { decrement: oldTx.amount } },
        });
      }

      // 2. Apply new balance changes
      const newAmount = amount !== undefined ? amount : Number(oldTx.amount);
      const newFromId = fromAccountId !== undefined ? fromAccountId : oldTx.fromAccountId;
      const newToId = toAccountId !== undefined ? toAccountId : oldTx.toAccountId;

      if (newFromId) {
        await tx.financialAccount.update({
          where: { id: newFromId },
          data: { balance: { decrement: newAmount } },
        });
      }
      if (newToId) {
        await tx.financialAccount.update({
          where: { id: newToId },
          data: { balance: { increment: newAmount } },
        });
      }

      // 3. Update the transaction
      return await tx.financialTransaction.update({
        where: { id: params.id },
        data: {
          date: date ? new Date(date) : oldTx.date,
          description: description || oldTx.description,
          amount: newAmount,
          fromAccountId: newFromId,
          toAccountId: newToId,
        },
      });
    });

    return NextResponse.json(updatedTx);
  } catch (error) {
    console.error("[TRANSACTION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const oldTx = await prisma.financialTransaction.findUnique({
      where: { id: params.id },
    });

    if (!oldTx) return new NextResponse("Transaction not found", { status: 404 });

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Reverse balance changes
      if (oldTx.fromAccountId) {
        await tx.financialAccount.update({
          where: { id: oldTx.fromAccountId },
          data: { balance: { increment: oldTx.amount } },
        });
      }
      if (oldTx.toAccountId) {
        await tx.financialAccount.update({
          where: { id: oldTx.toAccountId },
          data: { balance: { decrement: oldTx.amount } },
        });
      }

      // Delete transaction
      await tx.financialTransaction.delete({
        where: { id: params.id },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TRANSACTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
