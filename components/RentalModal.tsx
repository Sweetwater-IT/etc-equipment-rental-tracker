'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { EquipmentData } from '@/types/equipment';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RentalModalProps {
  open: boolean;
  equipment: EquipmentData | null;
  onOpenChange: (open: boolean) => void;
  onSave: (equipment: EquipmentData) => void;
}

type DateType = 'rentalStart' | 'rentalEnd' | 'billingStart' | 'billingEnd';

export default function RentalModal({ open, equipment, onOpenChange, onSave }: RentalModalProps) {
  const [rentalStartDate, setRentalStartDate] = useState<Date | undefined>(
    equipment?.startDate ? new Date(equipment.startDate) : undefined
  );
  const [rentalEndDate, setRentalEndDate] = useState<Date | undefined>(
    equipment?.endDate ? new Date(equipment.endDate) : undefined
  );
  const [billingStartDate, setBillingStartDate] = useState<Date | undefined>();
  const [billingEndDate, setBillingEndDate] = useState<Date | undefined>();
  const [customer, setCustomer] = useState(equipment?.customer || '');
  const [rentalAmount, setRentalAmount] = useState('');
  const [rentalFrequency, setRentalFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const handleDateSelect = (date: Date | undefined, dateType: DateType) => {
    if (dateType === 'rentalStart') setRentalStartDate(date);
    if (dateType === 'rentalEnd') setRentalEndDate(date);
    if (dateType === 'billingStart') setBillingStartDate(date);
    if (dateType === 'billingEnd') setBillingEndDate(date);
  };

  const handleDurationPreset = (days: number) => {
    if (!rentalStartDate) {
      setRentalStartDate(new Date());
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      setRentalEndDate(endDate);
    } else {
      const endDate = new Date(rentalStartDate);
      endDate.setDate(endDate.getDate() + days);
      setRentalEndDate(endDate);
    }
  };

  const handleBillingDurationPreset = (days: number) => {
    if (!billingStartDate) {
      setBillingStartDate(new Date());
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      setBillingEndDate(endDate);
    } else {
      const endDate = new Date(billingStartDate);
      endDate.setDate(endDate.getDate() + days);
      setBillingEndDate(endDate);
    }
  };

  const handleSave = () => {
    if (equipment && rentalStartDate && rentalEndDate) {
      const updatedEquipment: EquipmentData = {
        ...equipment,
        startDate: format(rentalStartDate, 'yyyy-MM-dd'),
        endDate: format(rentalEndDate, 'yyyy-MM-dd'),
        status: 'ON RENT' as const,
      };
      onSave(updatedEquipment);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Rental Information</DialogTitle>
          <DialogDescription>
            {equipment?.code} - {equipment?.type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rental Dates Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Rental Period</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Rental Start Date */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-9',
                        !rentalStartDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {rentalStartDate ? format(rentalStartDate, 'MMM dd, yyyy') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={rentalStartDate}
                      onSelect={(date) => handleDateSelect(date, 'rentalStart')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Rental End Date */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-9',
                        !rentalEndDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {rentalEndDate ? format(rentalEndDate, 'MMM dd, yyyy') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={rentalEndDate}
                      onSelect={(date) => handleDateSelect(date, 'rentalEnd')}
                      disabled={(date) => rentalStartDate ? date < rentalStartDate : false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Quick Duration Presets */}
            <div className="flex gap-2 flex-wrap pt-2">
              <span className="text-xs text-muted-foreground self-center">Quick set:</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDurationPreset(7)}
                className="h-7 text-xs"
              >
                7 days
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDurationPreset(30)}
                className="h-7 text-xs"
              >
                30 days
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDurationPreset(60)}
                className="h-7 text-xs"
              >
                60 days
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDurationPreset(90)}
                className="h-7 text-xs"
              >
                90 days
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDurationPreset(180)}
                className="h-7 text-xs"
              >
                6 months
              </Button>
            </div>
          </div>

          {/* Rental Price Section */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground">Rental Price</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={rentalAmount}
                  onChange={(e) => setRentalAmount(e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Frequency</Label>
                <Select value={rentalFrequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setRentalFrequency(value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Billing Dates Section */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground">Billing Period</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Billing Start Date */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-9',
                        !billingStartDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {billingStartDate ? format(billingStartDate, 'MMM dd, yyyy') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={billingStartDate}
                      onSelect={(date) => handleDateSelect(date, 'billingStart')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Billing End Date */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-9',
                        !billingEndDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {billingEndDate ? format(billingEndDate, 'MMM dd, yyyy') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={billingEndDate}
                      onSelect={(date) => handleDateSelect(date, 'billingEnd')}
                      disabled={(date) => billingStartDate ? date < billingStartDate : false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Same as Rental Period Button */}
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setBillingStartDate(rentalStartDate);
                  setBillingEndDate(rentalEndDate);
                }}
                disabled={!rentalStartDate || !rentalEndDate}
                className="h-7 text-xs"
              >
                Same as Rental Period
              </Button>
            </div>

            {/* Quick Duration Presets for Billing */}
            <div className="flex gap-2 flex-wrap pt-2">
              <span className="text-xs text-muted-foreground self-center">Quick set:</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleBillingDurationPreset(7)}
                className="h-7 text-xs"
              >
                7 days
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleBillingDurationPreset(30)}
                className="h-7 text-xs"
              >
                30 days
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleBillingDurationPreset(60)}
                className="h-7 text-xs"
              >
                60 days
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleBillingDurationPreset(90)}
                className="h-7 text-xs"
              >
                90 days
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleBillingDurationPreset(180)}
                className="h-7 text-xs"
              >
                6 months
              </Button>
            </div>
          </div>

          {/* Equipment Info */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-medium text-foreground">{equipment?.customer || 'Not assigned'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Monthly Rate:</span>
              <span className="font-medium text-foreground">
                ${equipment?.rentalRate ? equipment.rentalRate.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-xs">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!rentalStartDate} className="h-8 text-xs">
            Save Rental
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
