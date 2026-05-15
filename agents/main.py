import sys
import os
from dotenv import load_dotenv

# Ensure agents directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from graph import app

load_dotenv()

def run_business_cycle():
    print("--- Starting AI Agent Business Cycle ---")
    
    initial_state = {
        "demand_signals": "",
        "draft_pos": "",
        "final_decisions": "",
        "communications": [],
        "cycle_logs": []
    }
    
    # Run the graph
    final_output = app.invoke(initial_state)
    
    print("\n--- Cycle Complete ---")
    print("\nLogs:")
    for log in final_output["cycle_logs"]:
        print(f"- {log}")
        
    print("\nFinal Decisions:")
    print(final_output["final_decisions"])

if __name__ == "__main__":
    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY not found in .env")
        sys.exit(1)
        
    run_business_cycle()
