'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EquipmentList from '@/components/EquipmentList';
import TimelineHeader from '@/components/TimelineHeader';
import TimelineBody from '@/components/TimelineBody';
import { fetchEquipment, subscribeToEquipment, updateEquipment } from '@/lib/supabase-equipment';
import { EquipmentData } from '@/types/equipment';
import { Calendar } from 'lucide-react';

type ViewType = 'week' | 'month' | 'year';

export default function Home() {
  const [viewType, setViewType] = useState<ViewType>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState(new Date(2025, 0, 1)); // January 2025
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);

  useEffect(() => {
    fetchEquipment().then(setEquipment);
    const unsubscribe = subscribeToEquipment(setEquipment);
    return unsubscribe;
  }, []);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) => {
      const matchesSearch =
        eq.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eq.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesType = typeFilter === 'all' || eq.type === typeFilter;
      const matchesBranch = branchFilter === 'all' || eq.branch === branchFilter;
      return matchesSearch && matchesType && matchesBranch;
    });
  }, [searchTerm, typeFilter, branchFilter, equipment]);

  const equipmentTypes = ['all', ...Array.from(new Set(equipment.map((eq) => eq.type)))];
  const branches = ['all', ...Array.from(new Set(equipment.map((eq) => eq.branch)))];

  const handleEquipmentUpdate = async (updatedEquipment: EquipmentData) => {
    const result = await updateEquipment(updatedEquipment);
    if (result) {
      setEquipment((prev) => prev.map((eq) => (eq.id === result.id ? result : eq)));
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(startDate);
    if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setStartDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(startDate);
    if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setStartDate(newDate);
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
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] bg-background h-8 text-xs">
                <SelectValue placeholder="Equipment Type" />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Equipment Types' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[140px] bg-background h-8 text-xs">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch === 'all' ? 'All Branches' : branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1.5">
              {(['week', 'month', 'year'] as ViewType[]).map((view) => (
                <Button
                  key={view}
                  variant={viewType === view ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewType(view)}
                  className="capitalize h-7 text-xs px-3"
                >
                  {view}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={handlePrevious} className="h-7 text-xs px-2 bg-transparent">
                ← Prev
              </Button>
              <span className="text-xs font-medium min-w-24 text-center text-foreground">
                {startDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <Button variant="outline" size="sm" onClick={handleNext} className="h-7 text-xs px-2 bg-transparent">
                Next →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <EquipmentList
          equipment={filteredEquipment}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEquipmentUpdate={handleEquipmentUpdate}
        />
        <div className="flex-1 flex flex-col overflow-hidden border-l border-border">
          <TimelineHeader viewType={viewType} startDate={startDate} />
          <TimelineBody equipment={filteredEquipment} viewType={viewType} startDate={startDate} />
        </div>
      </div>
    </div>
  );
}
