-- Create equipment_entries table for rental history
-- Equipment table remains for inventory, equipment_entries for rentals

CREATE TABLE equipment_entries (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  customer TEXT,
  rental_rate DECIMAL(10,2),
  billing_start DATE,
  billing_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_equipment_entries_equipment_id ON equipment_entries(equipment_id);
CREATE INDEX idx_equipment_entries_dates ON equipment_entries(start_date, end_date);

-- Update equipment table to remove rental fields (optional, but recommended)
-- ALTER TABLE equipment DROP COLUMN IF EXISTS rental_start_date;
-- ALTER TABLE equipment DROP COLUMN IF EXISTS rental_end_date;
-- ALTER TABLE equipment DROP COLUMN IF EXISTS customer;
-- ALTER TABLE equipment DROP COLUMN IF EXISTS rental_rate;

-- But keep for now, migrate data if needed

-- Insert existing rentals into equipment_entries (if any)
-- INSERT INTO equipment_entries (equipment_id, start_date, end_date, customer, rental_rate)
-- SELECT id, rental_start_date::date, rental_end_date::date, customer, rental_rate
-- FROM equipment
-- WHERE rental_start_date IS NOT NULL;
