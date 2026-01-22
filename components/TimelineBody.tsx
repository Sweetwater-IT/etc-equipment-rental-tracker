'use client';

import { EquipmentData } from '@/types/equipment';
import { useMemo } from 'react';

type ViewType = 'month' | 'year';

interface TimelineBodyProps {
  equipment: EquipmentData[];
  viewType: ViewType;
  startDate: Date;
}

export default function TimelineBody({ equipment, viewType, startDate }: TimelineBodyProps) {
  const getDaysInView = () => {
    if (viewType === 'year') return 12;
    // Month view
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getCellWidth = () => {
    const timelineWidth = 1200;
    if (viewType === 'year') return 120;
    const days = getDaysInView();
    return timelineWidth / days;
  };

  const cellWidth = getCellWidth();
  const daysInView = getDaysInView();

  // All equipment, sorted by code
  const allEquipment = useMemo(() => {
    return [...equipment].sort((a, b) => a.code.localeCompare(b.code));
  }, [equipment]);

  // Calculate bar position
  const calculateBar = (startStr: string | Date, endStr: string | Date) => {
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
      // month daily
      const viewStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
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
    <div className="flex-1">
      {Array.from({ length: minRows }, (_, rowIndex) => {
        const eq = allEquipment[rowIndex];
        const bar = eq && eq.startDate && eq.endDate ? calculateBar(eq.startDate, eq.endDate) : null;

        return (
          <div id={`timeline-row-${rowIndex}`} key={eq?.id || `row-${rowIndex}`} className="relative h-12 border-b border-border hover:bg-muted/20">
            {/* Grid background */}
            <div className="absolute inset-0 flex" style={{ minWidth: `${daysInView * cellWidth}px` }}>{gridCells}</div>

            {/* Rental bar */}
            {eq && bar && (
              <div
                className="absolute top-2 h-5 bg-blue-50 border border-blue-200 rounded flex items-center px-2 text-[10px] font-medium text-blue-700 hover:brightness-95 transition-all cursor-pointer z-10"
                style={{ left: `${bar.left}px`, width: `${bar.width}px` }}
              >
                <span className="truncate">{eq.code}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
