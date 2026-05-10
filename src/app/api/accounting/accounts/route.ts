import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { AccountingService } from "@/lib/services/accounting.service";

export async function GET() {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    // Ensure default accounts exist
    await AccountingService.getOrCreateDefaultAccounts();

    const accounts = await prisma.financialAccount.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("[ACCOUNTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { name, type, description } = body;

    if (!name || !type) {
      return new NextResponse("Name and Type are required", { status: 400 });
    }

    const account = await prisma.financialAccount.create({
      data: {
        name,
        type,
        description,
        balance: 0,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error("[ACCOUNTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
