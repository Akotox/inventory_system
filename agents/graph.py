from typing import TypedDict, List, Annotated
import operator
from langgraph.graph import StateGraph, END
from agents.market import MarketAnalyst
from agents.procurement import ProcurementAgent
from agents.risk import RiskManager

# Define the shared state
class AgentState(TypedDict):
    demand_signals: str
    draft_pos: str
    final_decisions: str
    communications: Annotated[List[dict], operator.add] # New communication channel
    cycle_logs: Annotated[List[str], operator.add]

def market_analysis_node(state: AgentState):
    analyst = MarketAnalyst()
    signals, msgs = analyst.analyze(comms=state.get("communications", []))
    return {
        "demand_signals": signals,
        "communications": msgs,
        "cycle_logs": ["Market Analyst completed trend analysis."]
    }

def procurement_node(state: AgentState):
    trader = ProcurementAgent()
    pos, msgs = trader.draft_po(state["demand_signals"], comms=state.get("communications", []))
    return {
        "draft_pos": pos,
        "communications": msgs,
        "cycle_logs": ["Procurement Agent drafted Purchase Orders."]
    }

def risk_review_node(state: AgentState):
    risk_manager = RiskManager()
    decisions, msgs = risk_manager.review_trade(state["draft_pos"], comms=state.get("communications", []))
    return {
        "final_decisions": decisions,
        "communications": msgs,
        "cycle_logs": ["Risk Manager finalized trade reviews."]
    }

# Build the graph
workflow = StateGraph(AgentState)

workflow.add_node("market_analyst", market_analysis_node)
workflow.add_node("procurement", procurement_node)
workflow.add_node("risk_manager", risk_review_node)

workflow.set_entry_point("market_analyst")
workflow.add_edge("market_analyst", "procurement")
workflow.add_edge("procurement", "risk_manager")
workflow.add_edge("risk_manager", END)

# Compile
app = workflow.compile()
