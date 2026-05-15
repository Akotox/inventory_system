import os
import google.generativeai as genai
from memory.store import MemoryStore
from dotenv import load_dotenv

load_dotenv()

# Setup Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

class RiskManager:
    def __init__(self):
        self.memory = MemoryStore("RiskManager")
        self.budget_limit = 5000.00 # Example budget limit per cycle

    def review_trade(self, draft_pos, comms=None):
        """Audit draft POs for financial and operational risk."""
        recent_memories = self.memory.get_recent_memories(5)
        comms_summary = "\n".join([f"[{c.get('from', 'Unknown')}] -> {c.get('content', '')}" for c in (comms or [])])
        
        prompt = f"""
        You are the Risk Management Agent.
        You communicate with the Market Analyst and Procurement Agent.
        
        ### Communication Channel (Messages from others):
        {comms_summary}
        
        ### Proposed Trades (Draft POs):
        {draft_pos}
        
        ### Risk Parameters:
        - Current Cycle Budget Limit: ${self.budget_limit}
        
        ### Your Recent Memories:
        {recent_memories}
        
        Tasks:
        1. Audit trades.
        2. If you need more info from Procurement, add a message for them.
        
        Format your response as:
        ---MESSAGES---
        [ {{ "to": "Procurement", "msg": "..." }} ]
        ---DECISIONS---
        {{ "decisions": [...], "total_cycle_spend": ... }}
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        # Simple split
        msgs = []
        decisions = text
        if "---MESSAGES---" in text and "---DECISIONS---" in text:
            parts = text.split("---DECISIONS---")
            decisions = parts[1]
            msg_part = parts[0].replace("---MESSAGES---", "").strip()
            msgs = [{"from": "RiskManager", "content": msg_part}]

        self.memory.add_memory(f"Risk Assessment: {decisions}", metadata={"type": "risk_assessment"})
        
        return decisions, msgs
