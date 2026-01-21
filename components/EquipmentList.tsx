'use client';

import { useState, useMemo } from 'react';
import { EquipmentData } from '@/types/equipment';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import RentalModal from './RentalModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EquipmentListProps {
  equipment: EquipmentData[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEquipmentUpdate: (equipment: EquipmentData) => void;
}

const ITEMS_PER_PAGE = 25;

export default function EquipmentList({
  equipment,
  searchTerm,
  onSearchChange,
  onEquipmentUpdate,
}: EquipmentListProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSwitchChange = (eq: EquipmentData, checked: boolean) => {
    if (checked) {
      // Opening rental - show modal
      setSelectedEquipment(eq);
      setModalOpen(true);
    } else {
      // Closing rental
      const updatedEquipment: EquipmentData = {
        ...eq,
        status: 'AVAILABLE',
      };
      onEquipmentUpdate(updatedEquipment);
    }
  };

  const handleModalSave = (updatedEquipment: EquipmentData) => {
    const finalEquipment: EquipmentData = {
      ...updatedEquipment,
      status: 'ON RENT',
    };
    onEquipmentUpdate(finalEquipment);
  };

  // Pagination logic
  const totalPages = Math.ceil(equipment.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEquipment = equipment.slice(startIndex, endIndex);

  // Reset to page 1 when equipment changes (e.g., via search/filter)
  const prevEquipmentLength = equipment.length;
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [equipment.length, currentPage, totalPages]);

  return (
    <>
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border bg-muted/30">
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="h-8 text-sm"
          />
        </div>

        {/* Equipment List */}
        <div className="flex-1 overflow-y-auto">
          {paginatedEquipment.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No equipment found
            </div>
          ) : (
            paginatedEquipment.map((eq) => {
              const isOnRent = eq.status === 'ON RENT';
              return (
                <div
                  key={eq.id}
                  className="px-3 py-3 border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      {/* Category Badge */}
                      <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                        {eq.type}
                      </p>
                      {/* Equipment Code */}
                      <p className="text-sm font-semibold text-foreground truncate">{eq.code}</p>
                      {/* Equipment Details */}
                      <p className="text-xs text-muted-foreground truncate">
                        {eq.make} {eq.model}
                      </p>
                      <p className="text-xs text-muted-foreground">{eq.branch}</p>
                    </div>
                  </div>

                  {/* On Rent Switch */}
                  <div className="flex items-center gap-2 bg-muted/40 rounded px-2 py-2 mb-2">
                    <Switch
                      id={`switch-${eq.id}`}
                      checked={isOnRent}
                      onCheckedChange={(checked) => handleSwitchChange(eq, checked)}
                    />
                    <Label
                      htmlFor={`switch-${eq.id}`}
                      className="text-xs font-semibold cursor-pointer text-foreground flex-1"
                    >
                      {isOnRent ? 'On Rent' : 'Available'}
                    </Label>
                  </div>

                  {/* Customer and Rate */}
                  {isOnRent && (
                    <>
                      {eq.customer && (
                        <p className="text-xs text-foreground font-medium mb-1 truncate">
                          Customer: {eq.customer}
                        </p>
                      )}
                      {eq.rentalRate > 0 && (
                        <p className="text-xs text-muted-foreground">
                          ${eq.rentalRate}/mo
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t border-border bg-muted/30 p-2 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <RentalModal
        open={modalOpen}
        equipment={selectedEquipment}
        onOpenChange={setModalOpen}
        onSave={handleModalSave}
      />
    </>
  );
}
