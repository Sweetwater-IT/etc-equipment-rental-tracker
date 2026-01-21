import { supabase } from './supabase';
import { EquipmentData } from '@/types/equipment';

// Fetch all equipment
export async function fetchEquipment(): Promise<EquipmentData[]> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }

  return data.map(transformFromDB);
}

// Update equipment
export async function updateEquipment(equipment: EquipmentData): Promise<EquipmentData | null> {
  const dbData = transformToDB(equipment);

  const { data, error } = await supabase
    .from('equipment')
    .update(dbData)
    .eq('id', equipment.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating equipment:', error);
    return null;
  }

  return transformFromDB(data);
}

// Subscribe to equipment changes
export function subscribeToEquipment(callback: (equipment: EquipmentData[]) => void) {
  const channel = supabase
    .channel('equipment_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'equipment'
      },
      async (payload) => {
        console.log('Equipment change:', payload);
        // Refetch all equipment on any change
        const equipment = await fetchEquipment();
        callback(equipment);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
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
