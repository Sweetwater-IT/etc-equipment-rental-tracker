'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EquipmentTable from '@/components/EquipmentTable';
import { fetchEquipment } from '@/lib/supabase-equipment';
import { EquipmentData } from '@/types/equipment';
import Link from 'next/link';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);

  useEffect(() => {
    fetchEquipment().then((data) => {
      console.log('Equipment data:', data);
      setEquipment(data);
    });
  }, []);

  const handleTableAction = (action: string, equipment: EquipmentData) => {
    console.log('Action:', action, 'Equipment:', equipment);
    // TODO: Open modals based on action
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
    </div>
  );
}
