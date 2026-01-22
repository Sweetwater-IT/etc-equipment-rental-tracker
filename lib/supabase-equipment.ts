import { EquipmentData, RentalEntry } from '@/types/equipment';

// Fetch all equipment
export async function fetchEquipment(): Promise<EquipmentData[]> {
  try {
    const res = await fetch('/api/equipment');
    if (!res.ok) {
      console.error('Fetch failed:', res.status, res.statusText);
      const errorText = await res.text();
      console.error('Error response:', errorText);
      return [];
    }
    const data = await res.json();
    console.log('Fetched equipment:', data.length, 'items');
    return data;
  } catch (error) {
    console.error('Network error fetching equipment:', error);
    return [];
  }
}

// Create equipment
export async function createEquipment(equipment: Omit<EquipmentData, 'id'>): Promise<EquipmentData | null> {
  const res = await fetch('/api/equipment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(equipment),
  });
  if (!res.ok) return null;
  return res.json();
}

// Update equipment
export async function updateEquipment(equipment: EquipmentData): Promise<EquipmentData | null> {
  const res = await fetch('/api/equipment', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(equipment),
  });
  if (!res.ok) return null;
  return res.json();
}

// Delete equipment
export async function deleteEquipment(id: string): Promise<boolean> {
  const res = await fetch(`/api/equipment?id=${id}`, { method: 'DELETE' });
  return res.ok;
}

// Fetch all rentals
export async function fetchRentals(): Promise<RentalEntry[]> {
  try {
    const res = await fetch('/api/rentals');
    if (!res.ok) {
      console.error('Fetch rentals failed:', res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    console.log('Fetched rentals:', data.length, 'items');
    return data;
  } catch (error) {
    console.error('Network error fetching rentals:', error);
    return [];
  }
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
