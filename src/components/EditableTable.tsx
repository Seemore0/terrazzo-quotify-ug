import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, X, Edit3, Check, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TableRow {
  id: string;
  item: string;
  quantity: string;
  price: number;
  total: number;
}

interface EditableTableProps {
  title: string;
  phase: 'casting' | 'grinding';
  data: TableRow[];
  formatCurrency: (amount: number) => string;
  onDataChange: (data: TableRow[]) => void;
}

export const EditableTable = ({ 
  title, 
  phase, 
  data, 
  formatCurrency, 
  onDataChange 
}: EditableTableProps) => {
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();

  const handleEdit = (rowId: string, field: string, currentValue: string | number) => {
    setEditingCell({ rowId, field });
    setEditValue(currentValue.toString());
  };

  const handleSave = () => {
    if (!editingCell) return;

    const updatedData = data.map(row => {
      if (row.id === editingCell.rowId) {
        const updatedRow = { ...row };
        
        if (editingCell.field === 'item') {
          updatedRow.item = editValue;
        } else if (editingCell.field === 'quantity') {
          updatedRow.quantity = editValue;
        } else if (editingCell.field === 'price') {
          const price = parseFloat(editValue) || 0;
          updatedRow.price = price;
          // Recalculate total based on quantity and new price
          const quantityNumber = parseFloat(updatedRow.quantity.replace(/[^\d.]/g, '')) || 0;
          updatedRow.total = quantityNumber * price;
        }
        
        return updatedRow;
      }
      return row;
    });

    onDataChange(updatedData);
    setEditingCell(null);
    setEditValue('');
    toast({
      title: "Updated",
      description: "Table updated successfully",
    });
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const addRow = () => {
    const newRow: TableRow = {
      id: `${phase}-${Date.now()}`,
      item: 'New Item',
      quantity: '1',
      price: 0,
      total: 0
    };
    onDataChange([...data, newRow]);
    toast({
      title: "Row Added",
      description: "New row added to table",
    });
  };

  const removeRow = (rowId: string) => {
    const updatedData = data.filter(row => row.id !== rowId);
    onDataChange(updatedData);
    toast({
      title: "Row Removed",
      description: "Row removed from table",
    });
  };

  const calculateSubtotal = () => {
    return data.reduce((sum, row) => sum + row.total, 0);
  };

  const renderCell = (row: TableRow, field: string, value: string | number) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <XCircle className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    const displayValue = field === 'price' || field === 'total' 
      ? formatCurrency(value as number)
      : value;

    return (
      <div 
        className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-1 rounded"
        onClick={() => handleEdit(row.id, field, value)}
      >
        <span>{displayValue}</span>
        <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-primary">
            {title}
          </h3>
          <div className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded uppercase">
            {phase} PHASE
          </div>
        </div>
        <Button onClick={addRow} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left p-3 font-semibold bg-muted">Items</th>
              <th className="text-left p-3 font-semibold bg-muted">Quantity</th>
              <th className="text-right p-3 font-semibold bg-muted">Price (UGX)</th>
              <th className="text-right p-3 font-semibold bg-muted">Total (UGX)</th>
              <th className="text-center p-3 font-semibold bg-muted w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.id} className={`border-b ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                <td className="p-3">
                  {renderCell(row, 'item', row.item)}
                </td>
                <td className="p-3">
                  {renderCell(row, 'quantity', row.quantity)}
                </td>
                <td className="p-3 text-right">
                  {renderCell(row, 'price', row.price)}
                </td>
                <td className="p-3 text-right font-medium">
                  {formatCurrency(row.total)}
                </td>
                <td className="p-3 text-center">
                  <Button
                    onClick={() => removeRow(row.id)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-primary/5">
              <td colSpan={3} className="p-4 text-right font-bold text-lg">
                Total
              </td>
              <td className="p-4 text-right font-bold text-xl text-primary">
                {formatCurrency(calculateSubtotal())}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
};