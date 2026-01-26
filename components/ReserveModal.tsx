'use client';

import { useState, useEffect } from 'react';
import { EquipmentData } from '@/types/equipment';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ReserveModalProps {
  open: boolean;
  equipment: EquipmentData | null;
  onOpenChange: (open: boolean) => void;
  onSave: (reservation: any) => void;
}

export default function ReserveModal({ open, equipment, onOpenChange, onSave }: ReserveModalProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [customer, setCustomer] = useState('');
  const [rentalRate, setRentalRate] = useState(0);

  useEffect(() => {
    if (open && equipment) {
      setCustomer(equipment.customer || '');
      setRentalRate(equipment.rentalRate || 0);
    }
  }, [open, equipment]);

  const handleSave = () => {
    if (!startDate || !endDate || !customer) return;

    const reservation = {
      equipment_id: equipment?.id,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      customer,
      rental_rate: rentalRate,
    };

    onSave(reservation);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setCustomer('');
    setRentalRate(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reserve Equipment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer" className="text-right">
              Customer
            </Label>
            <Input
              id="customer"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rate" className="text-right">
              Rate ($/mo)
            </Label>
            <Input
              id="rate"
              type="number"
              value={rentalRate}
              onChange={(e) => setRentalRate(Number(e.target.value))}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`col-span-3 justify-start text-left font-normal ${!startDate && 'text-muted-foreground'}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`col-span-3 justify-start text-left font-normal ${!endDate && 'text-muted-foreground'}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Reserve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
