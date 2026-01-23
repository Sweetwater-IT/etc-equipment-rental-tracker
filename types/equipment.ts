export interface EquipmentData {
  id: number;
  type: string;
  code: string;
  make: string;
  model: string;
  branch: string;
  status: 'AVAILABLE' | 'ON RENT' | 'PENDING' | 'DAMAGED';
  customer?: string;
  rentalRate: number;
  startDate: string;
  endDate: string;
}

export interface RentalEntry {
  id: number;
  equipment_id: number;
  start_date: string;
  end_date: string;
  customer: string;
  rental_rate: number;
  billing_start?: string;
  billing_end?: string;
  created_at: string;
  updated_at: string;
  equipment_code: string;
  equipment_make: string;
  equipment_model: string;
  equipment_category: string;
}
