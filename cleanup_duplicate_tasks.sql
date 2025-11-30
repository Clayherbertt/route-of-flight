-- Clean up duplicate route_step_details
-- This removes duplicate tasks that have the same title and description for the same route_step

-- First, identify duplicates
WITH duplicates AS (
  SELECT 
    id,
    route_step_id,
    title,
    description,
    order_number,
    ROW_NUMBER() OVER (
      PARTITION BY route_step_id, LOWER(TRIM(title)), LOWER(TRIM(COALESCE(description, '')))
      ORDER BY order_number, created_at
    ) as row_num
  FROM route_step_details
)
-- Delete duplicates, keeping only the first occurrence (row_num = 1)
DELETE FROM route_step_details
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Verify cleanup
SELECT 
  route_step_id,
  LOWER(TRIM(title)) as title_key,
  COUNT(*) as count
FROM route_step_details
GROUP BY route_step_id, LOWER(TRIM(title))
HAVING COUNT(*) > 1;

-- If the above query returns no rows, all duplicates have been removed

