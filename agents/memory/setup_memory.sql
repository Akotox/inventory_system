-- SQL to create agent memory table
CREATE TABLE IF NOT EXISTS agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name VARCHAR(50) NOT NULL,
    memory_type VARCHAR(20) NOT NULL, -- episodic | semantic
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT now()
);
