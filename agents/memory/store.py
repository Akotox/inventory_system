import json
from datetime import datetime
from tools.db_tools import get_connection

class MemoryStore:
    def __init__(self, agent_name):
        self.agent_name = agent_name

    def add_memory(self, content, memory_type="semantic", metadata=None):
        """Add a new memory entry."""
        query = """
        INSERT INTO agent_memory (agent_name, memory_type, content, metadata)
        VALUES (%s, %s, %s, %s);
        """
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, (self.agent_name, memory_type, content, json.dumps(metadata) if metadata else None))
            conn.commit()

    def get_recent_memories(self, limit=10):
        """Retrieve recent memories for context."""
        query = """
        SELECT content, metadata, created_at
        FROM agent_memory
        WHERE agent_name = %s
        ORDER BY created_at DESC
        LIMIT %s;
        """
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, (self.agent_name, limit))
                return cur.fetchall()

    def search_memories(self, query_text):
        """
        Simple keyword search for now. 
        TODO: Implement semantic search with pgvector or embeddings.
        """
        sql = """
        SELECT content, metadata, created_at
        FROM agent_memory
        WHERE agent_name = %s AND content ILIKE %s
        ORDER BY created_at DESC;
        """
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (self.agent_name, f"%{query_text}%"))
                return cur.fetchall()
