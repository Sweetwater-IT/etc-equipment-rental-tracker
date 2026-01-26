'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EquipmentTable from '@/components/EquipmentTable';
import ReserveModal from '@/components/ReserveModal';
import { fetchEquipment, updateEquipment } from '@/lib/supabase-equipment';
import { EquipmentData } from '@/types/equipment';
import Link from 'next/link';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentData | null>(null);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);

  useEffect(() => {
    fetchEquipment().then((data) => {
      console.log('Equipment data:', data);
      setEquipment(data);
    });
  }, []);

  const handleTableAction = (action: string, eq: EquipmentData) => {
    if (action === 'Reserve') {
      setSelectedEquipment(eq);
      setReserveModalOpen(true);
    } else if (action === 'Rent') {
      // TODO: Open rental modal
      console.log('Rent:', eq);
    } else if (action === 'Remove from Rent') {
      const updated = { ...eq, status: 'AVAILABLE' as const, startDate: '', endDate: '', customer: '', rentalRate: 0 };
      handleEquipmentUpdate(updated);
    } else if (action === 'Remove from Reserve') {
      const updated = { ...eq, status: 'AVAILABLE' as const };
      handleEquipmentUpdate(updated);
    } else if (action === 'Mark Available') {
      const updated = { ...eq, status: 'AVAILABLE' as const };
      handleEquipmentUpdate(updated);
    }
  };

  const handleEquipmentUpdate = async (updatedEquipment: EquipmentData) => {
    const result = await updateEquipment(updatedEquipment);
    if (result) {
      setEquipment((prev) => prev.map((eq) => (eq.id === result.id ? result : eq)));
    }
  };

  const handleReserveSave = (reservation: any) => {
    if (selectedEquipment) {
      const updated = {
        ...selectedEquipment,
        status: 'RESERVE' as const,
        startDate: reservation.start_date,
        endDate: reservation.end_date,
        customer: reservation.customer,
        rentalRate: reservation.rental_rate,
      };
      handleEquipmentUpdate(updated);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">ETC Equipment Rental Tracker</h1>
              <p className="text-xs text-muted-foreground">Message boards, arrow boards, speed trailers and TMAs</p>
            </div>
            <div className="flex items-center gap-2">
              <Tabs defaultValue="equipment">
                <TabsList>
                  <TabsTrigger value="equipment" asChild>
                    <Link href="/equipment">Equipment</Link>
                  </TabsTrigger>
                  <TabsTrigger value="gantt" asChild>
                    <Link href="/gantt">Gantt</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="flex-1 overflow-auto">
        <EquipmentTable equipment={equipment} onAction={handleTableAction} />
      </div>

      <ReserveModal
        open={reserveModalOpen}
        equipment={selectedEquipment}
        onOpenChange={setReserveModalOpen}
        onSave={handleReserveSave}
      />
    </div>
  );
}
