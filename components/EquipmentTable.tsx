'use client';

import { EquipmentData } from '@/types/equipment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface EquipmentTableProps {
  equipment: EquipmentData[];
  onAction: (action: string, equipment: EquipmentData) => void;
}

export default function EquipmentTable({ equipment, onAction }: EquipmentTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'ON RENT': return 'bg-red-100 text-red-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'DOS': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActions = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return ['Reserve', 'Place on Rent'];
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
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((eq) => (
            <TableRow key={eq.id}>
              <TableCell>{eq.type}</TableCell>
              <TableCell>{eq.code}</TableCell>
              <TableCell>{eq.branch}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(eq.status)}>
                  {eq.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {getActions(eq.status).map((action) => (
                      <DropdownMenuItem
                        key={action}
                        onClick={() => onAction(action, eq)}
                      >
                        {action}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
