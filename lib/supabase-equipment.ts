// import { supabase } from './supabase';
import { EquipmentData } from '@/types/equipment';

// Fetch all equipment
export async function fetchEquipment(): Promise<EquipmentData[]> {
  // Temporarily return empty array - using hardcoded data instead
  return [];
}

// Update equipment
export async function updateEquipment(equipment: EquipmentData): Promise<EquipmentData | null> {
  // Temporarily return the equipment unchanged
  return equipment;
}

// Subscribe to equipment changes
export function subscribeToEquipment(callback: (equipment: EquipmentData[]) => void) {
  // Temporarily return a no-op unsubscribe function
  return () => {};
}

// Transform database row to EquipmentData
function transformFromDB(row: any): EquipmentData {
  return {
    id: row.id, // Use id as the primary key
    type: row.category, // category is the equipment type
    code: row.code,
    make: row.make,
    model: row.model,
    branch: row.etc_location,
    status: row.status as 'AVAILABLE' | 'ON RENT' | 'PENDING' | 'DAMAGED',
    customer: row.customer,
    rentalRate: parseFloat(row.rental_rate) || 0,
    startDate: row.rental_start_date,
    endDate: row.rental_end_date,
  };
}

// Transform EquipmentData to database format
function transformToDB(equipment: EquipmentData): any {
  return {
    category: equipment.type,
    code: equipment.code,
    make: equipment.make,
    model: equipment.model,
    etc_location: equipment.branch,
    status: equipment.status,
    customer: equipment.customer,
    rental_rate: equipment.rentalRate,
    rental_start_date: equipment.startDate,
    rental_end_date: equipment.endDate,
    updated_at: new Date().toISOString(),
  };
}
