export interface EquipmentData {
  id: string;
  type: string;
  code: string;
  make: string;
  model: string;
  branch: string;
  status: 'AVAILABLE' | 'ON RENT';
  customer?: string;
  rentalRate: number;
  startDate?: string;
  endDate?: string;
}
