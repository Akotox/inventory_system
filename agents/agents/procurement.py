import os
import google.generativeai as genai
from tools.db_tools import get_suppliers
from memory.store import MemoryStore
from dotenv import load_dotenv

load_dotenv()

# Setup Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

class ProcurementAgent:
    def __init__(self):
        self.memory = MemoryStore("ProcurementAgent")

    def draft_po(self, demand_signals, comms=None):
        """Select suppliers and draft POs based on demand signals."""
        suppliers = get_suppliers()
        recent_memories = self.memory.get_recent_memories(5)
        comms_summary = "\n".join([f"[{c.get('from', 'Unknown')}] -> {c.get('content', '')}" for c in (comms or [])])
        
        prompt = f"""
        You are the Procurement Agent.
        You communicate with the Market Analyst and Risk Manager.
        
        ### Communication Channel (Messages from others):
        {comms_summary}
        
        ### Demand Signals from Market Analyst:
        {demand_signals}
        
        ### Available Suppliers:
        {suppliers}
        
        ### Recent Memories:
        {recent_memories}
        
        Tasks:
        1. Draft POs for signals.
        2. Respond to messages from other agents.
        
        Format your response as:
        ---MESSAGES---
        [ {{ "to": "RiskManager", "msg": "..." }} ]
        ---POS---
        {{ "purchase_orders": [...] }}
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        # Simple split
        msgs = []
        pos = text
        if "---MESSAGES---" in text and "---POS---" in text:
            parts = text.split("---POS---")
            pos = parts[1]
            msg_part = parts[0].replace("---MESSAGES---", "").strip()
            # Note: In a real app, I'd parse the JSON here.
            msgs = [{"from": "ProcurementAgent", "content": msg_part}]

        self.memory.add_memory(f"Drafted POs for: {demand_signals}", metadata={"type": "po_drafting"})
        
        return pos, msgs
