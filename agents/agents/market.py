import os
import google.generativeai as genai
from tools.db_tools import get_recent_sales, get_low_stock_products
from memory.store import MemoryStore
from dotenv import load_dotenv

load_dotenv()

# Setup Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

class MarketAnalyst:
    def __init__(self):
        self.memory = MemoryStore("MarketAnalyst")

    def analyze(self, comms=None):
        """Perform market analysis and emit signals."""
        sales_data = get_recent_sales(30)
        low_stock = get_low_stock_products()
        
        # Format data for LLM
        sales_summary = self._format_sales(sales_data)
        low_stock_summary = self._format_low_stock(low_stock)
        recent_memories = self.memory.get_recent_memories(5)
        comms_summary = self._format_comms(comms)
        
        prompt = f"""
        You are the Market Analyst Agent. 
        You can communicate with the Procurement Agent and Risk Manager.
        
        ### Communication Channel (Messages from others):
        {comms_summary}
        
        ### Recent Sales Data:
        {sales_summary}
        
        ### Low Stock Alerts:
        {low_stock_summary}
        
        ### Your Recent Insights:
        {recent_memories}
        
        Tasks:
        1. Identify top 3 items needing reorder.
        2. If there are messages from other agents (e.g. Procurement asking for details), address them.
        3. Provide "Demand Signals" in JSON.
        4. Add any "Internal Messages" for other agents.
        
        Format your response as:
        ---MESSAGES---
        [ {{ "to": "Procurement", "msg": "..." }} ]
        ---SIGNALS---
        [ {{ "product_id": "...", "confidence": 0.9, ... }} ]
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        # Simple split for now
        msgs = []
        signals = text
        if "---MESSAGES---" in text and "---SIGNALS---" in text:
            parts = text.split("---SIGNALS---")
            signals = parts[1]
            msg_part = parts[0].replace("---MESSAGES---", "").strip()
            # In a real app, I'd parse JSON here.
            msgs = [{"from": "MarketAnalyst", "content": msg_part}]

        # Store the insight
        self.memory.add_memory(signals, metadata={"type": "market_analysis"})
        
        return signals, msgs

    def _format_comms(self, comms):
        if not comms: return "No active communications."
        return "\n".join([f"[{c.get('from', 'Unknown')}] -> {c.get('content', '')}" for c in comms])

    def _format_sales(self, data):
        if not data: return "No sales in the last 30 days."
        summary = ""
        for s in data:
            summary += f"- {s['product_name']}: Qty {s['quantity']} on {s['sale_date']}\n"
        return summary

    def _format_low_stock(self, data):
        if not data: return "All stock levels healthy."
        summary = ""
        for p in data:
            summary += f"- {p['name']} (SKU: {p['sku']}): Stock {p['current_stock']} / Reorder at {p['reorder_level']}\n"
        return summary
