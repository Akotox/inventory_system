import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!apiKey) {
    return new NextResponse("Gemini API key not configured", { status: 500 });
  }

  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Fetch active accounts for context
    const accounts = await prisma.financialAccount.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true },
    });

    const accountsContext = accounts.map(a => `- ${a.name} (Type: ${a.type}, ID: ${a.id})`).join('\n');

    const systemPrompt = `You are an expert accountant system. 
You are provided with a natural language description of a financial event and a list of available accounts in our system.
Your job is to determine the correct double-entry accounting transactions for this event.

Available Accounts:
${accountsContext}

Instructions:
1. Analyze the event and determine the necessary debit and credit entries.
2. Select the correct 'fromAccountId' (which represents the source of funds, usually the Credit side for assets/expenses or Debit side for liabilities/equity/revenue, according to double-entry rules. In this system, money flows FROM 'fromAccountId' TO 'toAccountId'. For example, if buying inventory with cash, money flows from Cash to Inventory).
3. If multiple transactions are needed (e.g. sale involving COGS and Revenue), return multiple objects.
4. Ensure the total value is balanced.
5. You MUST return ONLY a valid JSON array of objects, with no markdown formatting or extra text.

Example output:
[
  {
    "amount": 100.00,
    "fromAccountId": "id-of-cash-account",
    "toAccountId": "id-of-inventory-account",
    "description": "Purchased inventory with cash"
  }
]
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nEvent: " + prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    let parsedData;
    
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", responseText);
      return new NextResponse("Failed to parse AI response", { status: 500 });
    }

    // Attach account names to the response for the frontend preview
    const enrichedData = parsedData.map((entry: any) => {
      const fromAccount = accounts.find(a => a.id === entry.fromAccountId);
      const toAccount = accounts.find(a => a.id === entry.toAccountId);
      return {
        ...entry,
        fromAccountName: fromAccount?.name || 'Unknown',
        toAccountName: toAccount?.name || 'Unknown'
      };
    });

    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error("[AI_ENTRY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
