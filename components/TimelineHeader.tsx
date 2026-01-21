'use client';

type ViewType = 'week' | 'month' | 'year';

interface TimelineHeaderProps {
  viewType: ViewType;
  startDate: Date;
}

export default function TimelineHeader({ viewType, startDate }: TimelineHeaderProps) {
  const getDaysInView = () => {
    if (viewType === 'week') return 7;
    if (viewType === 'year') return 12;

    // Month view
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return daysInMonth;
  };

  const getCellWidth = () => {
    if (viewType === 'week') return 120;
    if (viewType === 'year') return 120;
    return 40;
  };

  const generateHeaders = () => {
    const days = getDaysInView();
    const headers: React.ReactElement[] = [];
    const currentDate = new Date(startDate);
    const cellWidth = getCellWidth();

    if (viewType === 'month') {
      // Month view - show days
      for (let i = 0; i < days; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        const dayNum = date.getDate();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        headers.push(
          <div
            key={i}
            className={`flex-shrink-0 border-r border-border text-center py-2 ${
              isWeekend ? 'bg-muted/30' : ''
            }`}
            style={{ width: `${cellWidth}px` }}
          >
            <div className="text-[10px] text-muted-foreground uppercase">{dayName}</div>
            <div className="text-xs font-semibold text-foreground">{dayNum}</div>
          </div>
        );
      }
    } else if (viewType === 'week') {
      // Week view - show days
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        const dayNum = date.getDate();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        headers.push(
          <div
            key={i}
            className={`flex-shrink-0 border-r border-border text-center py-2 ${
              isWeekend ? 'bg-muted/30' : ''
            }`}
            style={{ width: `${cellWidth}px` }}
          >
            <div className="text-[10px] text-muted-foreground uppercase">{dayName}</div>
            <div className="text-sm font-semibold text-foreground">{monthName} {dayNum}</div>
          </div>
        );
      }
    } else {
      // Year view - show months
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });

        headers.push(
          <div
            key={i}
            className="flex-shrink-0 border-r border-border text-center py-2"
            style={{ width: `${cellWidth}px` }}
          >
            <div className="text-sm font-semibold text-foreground">{monthName}</div>
          </div>
        );
      }
    }

    return headers;
  };

  return (
    <div className="border-b border-border bg-muted/50 overflow-x-auto">
      <div className="flex">{generateHeaders()}</div>
    </div>
  );
}
