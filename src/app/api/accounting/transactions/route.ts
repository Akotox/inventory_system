import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  try {
    const transactions = await prisma.financialTransaction.findMany({
      where: accountId ? {
        OR: [
          { fromAccountId: accountId },
          { toAccountId: accountId },
        ]
      } : {},
      include: {
        fromAccount: true,
        toAccount: true,
        createdBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { date, description, amount, fromAccountId, toAccountId, referenceId, referenceType } = body;

    if (!description || !amount) {
      return new NextResponse("Description and Amount are required", { status: 400 });
    }

    // Use a transaction to create the financial transaction and update account balances
    const transaction = await prisma.$transaction(async (tx) => {
      const ft = await tx.financialTransaction.create({
        data: {
          date: date ? new Date(date) : new Date(),
          description,
          amount,
          fromAccountId,
          toAccountId,
          referenceId,
          referenceType,
          createdById: session.user!.id!,
        },
      });

      // Update balances
      if (fromAccountId) {
        await tx.financialAccount.update({
          where: { id: fromAccountId },
          data: { balance: { decrement: amount } },
        });
      }

      if (toAccountId) {
        await tx.financialAccount.update({
          where: { id: toAccountId },
          data: { balance: { increment: amount } },
        });
      }

      return ft;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[TRANSACTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
