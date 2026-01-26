'use client';

import { useState, useMemo, useEffect } from 'react';
import { EquipmentData, RentalEntry } from '@/types/equipment';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import RentalModal from './RentalModal';
import ReserveModal from './ReserveModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EquipmentListProps {
  equipment: EquipmentData[];
  rentals: RentalEntry[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEquipmentUpdate: (equipment: EquipmentData) => void;
}

const ITEMS_PER_PAGE = 25;

export default function EquipmentList({
  equipment,
  rentals,
  searchTerm,
  onSearchChange,
  onEquipmentUpdate,
}: EquipmentListProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pressedSwitch, setPressedSwitch] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'RESERVE': return 'bg-yellow-100 text-yellow-800';
      case 'ON RENT': return 'bg-red-100 text-red-800';
      case 'MAINTENANCE': return 'bg-orange-100 text-orange-800';
      case 'DOS': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActions = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return ['Reserve', 'Rent'];
      case 'RESERVE':
        return ['Rent', 'Remove from Reserve'];
      case 'ON RENT':
        return ['Remove from Rent'];
      case 'MAINTENANCE':
        return ['Mark Available'];
      case 'DOS':
        return ['Mark Available'];
      default:
        return [];
    }
  };

  const handleAction = (action: string, eq: EquipmentData) => {
    if (action === 'Rent') {
      setPressedSwitch(eq.id);
      setSelectedEquipment(eq);
      setTimeout(() => {
        setModalOpen(true);
        setPressedSwitch(null);
      }, 200);
    } else if (action === 'Remove from Rent') {
      const updated = { ...eq, status: 'AVAILABLE' as const, startDate: '', endDate: '', customer: '', rentalRate: 0 };
      onEquipmentUpdate(updated);
    } else if (action === 'Reserve') {
      setSelectedEquipment(eq);
      setReserveModalOpen(true);
    } else if (action === 'Remove from Reserve') {
      const updated = { ...eq, status: 'AVAILABLE' as const };
      onEquipmentUpdate(updated);
    } else if (action === 'Mark Available') {
      const updated = { ...eq, status: 'AVAILABLE' as const };
      onEquipmentUpdate(updated);
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
      onEquipmentUpdate(updated);
    }
  };

  const handleModalSave = (updatedEquipment: EquipmentData) => {
    setSaved(true);
    const finalEquipment: EquipmentData = {
      ...updatedEquipment,
      status: 'ON RENT',
    };
    onEquipmentUpdate(finalEquipment);
  };

  const handleModalOpenChange = (open: boolean) => {
    setSaved(false);
    setModalOpen(open);
  };

  // Pagination logic
  const totalPages = Math.ceil(equipment.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEquipment = equipment.slice(startIndex, endIndex);

  // All equipment, sorted by code for timeline indexing
  const allEquipment = useMemo(() => {
    return [...equipment].sort((a, b) => a.code.localeCompare(b.code));
  }, [equipment]);

  // Reset to page 1 when equipment changes (e.g., via search/filter)
  const prevEquipmentLength = equipment.length;
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [equipment.length, currentPage, totalPages]);

  const handleEquipmentClick = (eq: EquipmentData) => {
    if (eq.status === 'ON RENT') {
      const index = allEquipment.findIndex(e => e.id === eq.id);
      if (index !== -1) {
        document.getElementById(`timeline-row-${index}`)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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
              return (
                <div
                  key={eq.id}
                  className="px-3 py-3 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleEquipmentClick(eq)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      {/* Category Badge */}
                      <p className="text-sm font-bold text-primary uppercase tracking-wide mb-1">
                        {(eq as any).category}
                      </p>
                      {/* Equipment Code */}
                      <p className="text-sm font-semibold text-foreground truncate">{eq.code}</p>
                      {/* Equipment Details */}
                      <p className="text-xs text-muted-foreground truncate">
                        {eq.make} {eq.model}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">{(eq as any).etc_location}</p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-2 bg-muted/40 rounded px-2 py-2 mb-2">
                    <Badge className={getStatusColor(eq.status)}>{eq.status}</Badge>
                    <div className="flex gap-1">
                      {getActions(eq.status).map(action => {
                        const getButtonClasses = (action: string) => {
                          const base = `h-6 px-2 transition-all duration-150 ease-out text-xs ${pressedSwitch === eq.id ? 'scale-95 shadow-sm' : 'scale-100'}`;
                          switch (action) {
                            case 'Reserve': return `${base} bg-yellow-100 border-yellow-800 text-yellow-800 hover:bg-yellow-200`;
                            case 'Rent': return `${base} bg-blue-100 border-blue-800 text-blue-800 hover:bg-blue-200`;
                            case 'Remove from Rent': return `${base} bg-red-100 border-red-800 text-red-800 hover:bg-red-200`;
                            case 'Remove from Reserve': return `${base} bg-gray-100 border-gray-800 text-gray-800 hover:bg-gray-200`;
                            case 'Mark Available': return `${base} bg-gray-100 border-gray-800 text-gray-800 hover:bg-gray-200`;
                            default: return base;
                          }
                        };
                        return (
                          <Button
                            key={action}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(action, eq)}
                            className={getButtonClasses(action)}
                          >
                            {action}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer and Rate */}
                  {eq.status === 'ON RENT' && (
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
        onOpenChange={handleModalOpenChange}
        onSave={handleModalSave}
      />

      <ReserveModal
        open={reserveModalOpen}
        equipment={selectedEquipment}
        onOpenChange={setReserveModalOpen}
        onSave={handleReserveSave}
      />
    </>
  );
}
