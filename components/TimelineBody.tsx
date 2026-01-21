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
  const getDaysInView = () => {
    if (viewType === 'week') return 7;
    if (viewType === 'year') return 12;
    // Month view
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getCellWidth = () => {
    if (viewType === 'week') return 120;
    if (viewType === 'year') return 120;
    return 40;
  };

  const cellWidth = getCellWidth();
  const daysInView = getDaysInView();

  // All equipment, sorted by code
  const allEquipment = useMemo(() => {
    return [...equipment].sort((a, b) => a.code.localeCompare(b.code));
  }, [equipment]);

  // Calculate bar position
  const calculateBar = (startStr: string, endStr: string) => {
    const rentalStart = new Date(startStr);
    const rentalEnd = new Date(endStr);

    if (viewType === 'year') {
      const yearStart = startDate.getFullYear();
      const startMonth = rentalStart.getMonth();
      const endMonth = rentalEnd.getMonth();
      const visibleStart = Math.max(0, startMonth);
      const visibleEnd = Math.min(11, endMonth);
      if (visibleStart > 11 || visibleEnd < 0) return null;
      const width = (visibleEnd - visibleStart + 1) * cellWidth;
      const left = visibleStart * cellWidth;
      return { left, width };
    } else {
      // week/month daily
      let viewStart: Date;
      if (viewType === 'week') {
        viewStart = new Date(startDate);
      } else {
        viewStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      }
      const startOffset = Math.floor((rentalStart.getTime() - viewStart.getTime()) / (86400000));
      const endOffset = Math.floor((rentalEnd.getTime() - viewStart.getTime()) / (86400000));
      const visibleStart = Math.max(0, startOffset);
      const visibleEnd = Math.min(daysInView - 1, endOffset);
      if (visibleStart > daysInView - 1 || visibleEnd < 0) return null;
      const width = (visibleEnd - visibleStart + 1) * cellWidth;
      const left = visibleStart * cellWidth;
      return { left, width };
    }
  };

  // Render grid cells
  const gridCells = useMemo(() => {
    return Array.from({ length: daysInView }, (_, i) => {
      let date: Date;
      let isWeekend = false;
      if (viewType === 'month') {
        date = new Date(startDate.getFullYear(), startDate.getMonth(), i + 1);
        isWeekend = date.getDay() === 0 || date.getDay() === 6;
      } else if (viewType === 'week') {
        date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        isWeekend = date.getDay() === 0 || date.getDay() === 6;
      } else { // year
        date = new Date(startDate.getFullYear(), i, 1);
        // no weekend for months
      }

      return (
        <div
          key={i}
          className={`flex-shrink-0 border-r border-border h-full ${isWeekend ? 'bg-muted/30' : ''}`}
          style={{ width: `${cellWidth}px` }}
        />
      );
    });
  }, [daysInView, startDate, viewType, cellWidth]);

  const minRows = Math.max(15, allEquipment.length);

  return (
    <div className="flex-1 overflow-auto">
      {Array.from({ length: minRows }, (_, rowIndex) => {
        const eq = allEquipment[rowIndex];
        const bar = eq && eq.status === 'ON RENT' && eq.startDate && eq.endDate ? calculateBar(eq.startDate, eq.endDate) : null;

        return (
          <div key={eq?.id || `row-${rowIndex}`} className="relative h-12 border-b border-border hover:bg-muted/20">
            {/* Grid background */}
            <div className="absolute inset-0 flex">{gridCells}</div>

            {/* Rental bar */}
            {eq && bar && (
              <div
                className="absolute top-2 h-8 bg-red-100 border-2 border-red-800 rounded-md shadow-lg flex items-center px-3 z-20"
                style={{ left: `${bar.left}px`, width: `${bar.width}px` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {eq.code} - {eq.customer || 'No Customer'}
                  </p>
                  {eq.rentalRate > 0 && (
                    <p className="text-[10px] text-black">${eq.rentalRate}/mo</p>
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
