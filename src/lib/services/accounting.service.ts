import { prisma } from "@/lib/prisma";
import { FinancialAccountType } from "@prisma/client";

export class AccountingService {
  /** Ensure default accounts exist and return them */
  static async getOrCreateDefaultAccounts() {
    const defaults = [
      { name: "Cash", type: FinancialAccountType.ASSET },
      { name: "Bank", type: FinancialAccountType.ASSET },
      { name: "Sales Income", type: FinancialAccountType.REVENUE },
      { name: "Cost of Goods Sold", type: FinancialAccountType.EXPENSE },
      { name: "Operating Expenses", type: FinancialAccountType.EXPENSE },
      { name: "Accounts Receivable", type: FinancialAccountType.ASSET },
      { name: "Accounts Payable", type: FinancialAccountType.LIABILITY },
      { name: "Opening Balance Equity", type: FinancialAccountType.EQUITY },
    ];

    const results: Record<string, string> = {};

    for (const def of defaults) {
      let acc = await prisma.financialAccount.findUnique({
        where: { name: def.name }
      });

      if (!acc) {
        acc = await prisma.financialAccount.create({
          data: { name: def.name, type: def.type }
        });
      }
      results[def.name] = acc.id;
    }

    return results;
  }

  /** Record a transaction atomically within a provided transaction context if available */
  static async recordTransaction(tx: any, data: {
    description: string;
    amount: number;
    fromAccountName: string;
    toAccountName: string;
    referenceId?: string;
    referenceType?: string;
    createdById: string;
  }) {
    // We need to fetch account IDs. Since we are inside a tx, we use that.
    const fromAcc = await tx.financialAccount.findUniqueOrThrow({ where: { name: data.fromAccountName } });
    const toAcc = await tx.financialAccount.findUniqueOrThrow({ where: { name: data.toAccountName } });

    const ft = await tx.financialTransaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        fromAccountId: fromAcc.id,
        toAccountId: toAcc.id,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        createdById: data.createdById,
      }
    });

    // Update balances
    await tx.financialAccount.update({
      where: { id: fromAcc.id },
      data: { balance: { decrement: data.amount } }
    });

    await tx.financialAccount.update({
      where: { id: toAcc.id },
      data: { balance: { increment: data.amount } }
    });

    return ft;
  }
}
