'use client';

import { EquipmentData } from '@/types/equipment';
import { useMemo } from 'react';

type ViewType = 'week' | 'month' | 'year';

interface TimelineBodyProps {
  equipment: EquipmentData[];
  viewType: ViewType;
  startDate: Date;
}

export default function TimelineBody({ equipment, viewType, startDate }: TimelineBodyProps) {
  const CELL_WIDTH = 40;

  // Filter on-rent equipment
  const onRentEquipment = useMemo(() => {
    return equipment
      .filter((eq) => eq.status === 'ON RENT' && eq.startDate && eq.endDate)
      .sort((a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime());
  }, [equipment]);

  // Get days in current month
  const daysInMonth = useMemo(() => {
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [startDate]);

  // Calculate bar position
  const calculateBar = (startStr: string, endStr: string) => {
    const rentalStart = new Date(startStr);
    const rentalEnd = new Date(endStr);
    const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    // Days from month start
    const startOffset = Math.floor((rentalStart.getTime() - monthStart.getTime()) / (86400000));
    const endOffset = Math.floor((rentalEnd.getTime() - monthStart.getTime()) / (86400000));

    // Clamp to visible month
    const visibleStart = Math.max(0, startOffset);
    const visibleEnd = Math.min(daysInMonth - 1, endOffset);

    if (visibleStart > daysInMonth - 1 || visibleEnd < 0) return null;

    const width = (visibleEnd - visibleStart + 1) * CELL_WIDTH;
    const left = visibleStart * CELL_WIDTH;

    return { left, width };
  };

  // Render grid cells
  const gridCells = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(startDate.getFullYear(), startDate.getMonth(), i + 1);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      return (
        <div
          key={i}
          className={`flex-shrink-0 border-r border-border h-full ${isWeekend ? 'bg-muted/30' : ''}`}
          style={{ width: `${CELL_WIDTH}px` }}
        />
      );
    });
  }, [daysInMonth, startDate]);

  const minRows = Math.max(15, onRentEquipment.length);

  return (
    <div className="flex-1 overflow-auto">
      {Array.from({ length: minRows }, (_, rowIndex) => {
        const eq = onRentEquipment[rowIndex];
        const bar = eq ? calculateBar(eq.startDate!, eq.endDate!) : null;

        return (
          <div key={eq?.id || `row-${rowIndex}`} className="relative h-12 border-b border-border hover:bg-muted/20">
            {/* Grid background */}
            <div className="absolute inset-0 flex">{gridCells}</div>

            {/* Red rental bar */}
            {eq && bar && (
              <div
                className="absolute top-2 h-8 bg-red-500 border-2 border-red-700 rounded-md shadow-lg flex items-center px-3 z-20"
                style={{ left: `${bar.left}px`, width: `${bar.width}px` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {eq.code} - {eq.customer || 'No Customer'}
                  </p>
                  {eq.rentalRate > 0 && (
                    <p className="text-[10px] text-white/90">${eq.rentalRate}/mo</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
