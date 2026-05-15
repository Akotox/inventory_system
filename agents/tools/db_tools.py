import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    return psycopg2.connect(DATABASE_URL, sslmode='require')

def get_low_stock_products():
    """Fetch products where quantity is at or below reorder_level."""
    query = """
    SELECT p.id, p.name, p.sku, p.reorder_level, p.reorder_quantity, 
           (SELECT SUM(quantity) FROM inventory_movements WHERE product_id = p.id) as current_stock
    FROM products p
    WHERE is_active = true
    HAVING (SELECT SUM(quantity) FROM inventory_movements WHERE product_id = p.id) <= p.reorder_level;
    """
    # Note: The above query assumes inventory_movements.quantity is the delta.
    # Actually, inventory_movements has quantity_after. We should get the latest.
    
    query = """
    WITH LatestMovements AS (
        SELECT DISTINCT ON ("productId") "productId", "quantityAfter"
        FROM inventory_movements
        ORDER BY "productId", "createdAt" DESC
    )
    SELECT p.id, p.name, p.sku, p."reorderLevel", p."reorderQuantity", COALESCE(lm."quantityAfter", 0) as current_stock
    FROM products p
    LEFT JOIN LatestMovements lm ON p.id = lm."productId"
    WHERE p."isActive" = true AND COALESCE(lm."quantityAfter", 0) <= p."reorderLevel";
    """
    
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            return cur.fetchall()

def get_recent_sales(days=30):
    """Fetch sales data for the last N days."""
    query = """
    SELECT s.id, s.total, s."saleDate", si."productId", si.quantity, p.name as product_name
    FROM sales s
    JOIN sale_items si ON s.id = si."saleId"
    JOIN products p ON si."productId" = p.id
    WHERE s."saleDate" >= NOW() - INTERVAL '%s days'
    ORDER BY s."saleDate" DESC;
    """
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, (days,))
            return cur.fetchall()

def get_suppliers():
    """Fetch all suppliers."""
    query = 'SELECT id, name, email FROM suppliers WHERE "isActive" = true;'
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            return cur.fetchall()
