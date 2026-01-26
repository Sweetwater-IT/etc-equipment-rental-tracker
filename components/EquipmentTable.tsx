'use client';

import { EquipmentData } from '@/types/equipment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useState, useMemo } from 'react';

interface EquipmentTableProps {
  equipment: EquipmentData[];
  onAction: (action: string, equipment: EquipmentData) => void;
}

export default function EquipmentTable({ equipment, onAction }: EquipmentTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) =>
      ((eq as any).code || '').toLowerCase().includes(search.toLowerCase()) ||
      ((eq as any).category || '').toLowerCase().includes(search.toLowerCase()) ||
      ((eq as any).make || '').toLowerCase().includes(search.toLowerCase()) ||
      ((eq as any).model || '').toLowerCase().includes(search.toLowerCase()) ||
      ((eq as any).etc_location || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [equipment, search]);

  const paginatedEquipment = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEquipment.slice(start, start + pageSize);
  }, [filteredEquipment, page, pageSize]);

  const totalPages = Math.ceil(filteredEquipment.length / pageSize);

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

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search equipment (code, type, make, model, branch)..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-md h-9"
        />
        <div className="text-sm text-muted-foreground">
          {filteredEquipment.length} of {equipment.length} equipment
        </div>
      </div>

      <Table className="table-fixed">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-[120px]">Category</TableHead>
            <TableHead className="w-[100px]">Code</TableHead>
            <TableHead className="w-[100px]">Make</TableHead>
            <TableHead className="w-[100px]">Model</TableHead>
            <TableHead className="w-[120px]">Branch</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedEquipment.map((eq) => (
            <TableRow key={eq.id}>
              <TableCell className="font-medium border-r py-2">{capitalizeWords((eq as any).category || eq.type || '')}</TableCell>
              <TableCell className="border-r py-2">{(eq as any).code || eq.code || ''}</TableCell>
              <TableCell className="border-r py-2">{(eq as any).make || eq.make || ''}</TableCell>
              <TableCell className="border-r py-2">{(eq as any).model || eq.model || ''}</TableCell>
              <TableCell className="border-r py-2">{(eq as any).etc_location || eq.branch || ''}</TableCell>
              <TableCell className="border-r py-2">
                <Badge className={getStatusColor(eq.status)}>
                  {eq.status}
                </Badge>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex gap-1">
                  {getActions(eq.status).map((action) => {
                    const getButtonClasses = (action: string) => {
                      const base = 'h-7 text-xs px-2';
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
                        onClick={() => onAction(action, eq)}
                        className={getButtonClasses(action)}
                      >
                        {action}
                      </Button>
                    );
                  })}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
