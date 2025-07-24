import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, CheckCircle } from 'lucide-react';

interface ProjectData {
  area: number;
  unit: 'sqm' | 'sqft';
  phases: ('casting' | 'grinding')[];
}

interface ProjectDetailsFormProps {
  data: ProjectData;
  onChange: (data: ProjectData) => void;
  formatCurrency: (amount: number) => string;
  calculateTotal: () => number;
}

export const ProjectDetailsForm = ({ 
  data, 
  onChange, 
  formatCurrency, 
  calculateTotal 
}: ProjectDetailsFormProps) => {
  
  const handleAreaChange = (area: number) => {
    onChange({ ...data, area });
  };

  const handleUnitToggle = () => {
    const newUnit = data.unit === 'sqm' ? 'sqft' : 'sqm';
    const convertedArea = data.unit === 'sqm' 
      ? data.area / 0.0929  // m² to ft²
      : data.area * 0.0929; // ft² to m²
    
    onChange({ 
      ...data, 
      unit: newUnit,
      area: parseFloat(convertedArea.toFixed(2))
    });
  };

  const handlePhaseToggle = (phase: 'casting' | 'grinding') => {
    const currentPhases = [...data.phases];
    const phaseIndex = currentPhases.indexOf(phase);
    
    if (phaseIndex > -1) {
      currentPhases.splice(phaseIndex, 1);
    } else {
      currentPhases.push(phase);
    }
    
    onChange({ ...data, phases: currentPhases });
  };

  const getAreaInSqm = () => {
    return data.unit === 'sqft' ? data.area * 0.0929 : data.area;
  };

  const getPhaseRate = () => {
    if (data.phases.length === 2) return 26969;
    if (data.phases.includes('casting')) return 18926;
    if (data.phases.includes('grinding')) return 8043;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Area Input */}
      <div className="space-y-4">
        <Label htmlFor="projectArea" className="text-lg font-medium">
          Project Area *
        </Label>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              id="projectArea"
              type="number"
              placeholder="Enter area"
              value={data.area || ''}
              onChange={(e) => handleAreaChange(parseFloat(e.target.value) || 0)}
              className="text-lg shadow-input"
              min="0"
              step="0.01"
            />
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleUnitToggle}
            className="flex items-center gap-2 px-4"
          >
            <ArrowRightLeft className="h-4 w-4" />
            {data.unit === 'sqm' ? 'm²' : 'ft²'}
          </Button>
        </div>

        {data.area > 0 && (
          <div className="text-sm text-muted-foreground">
            = {getAreaInSqm().toFixed(2)} m² 
            {data.unit === 'sqft' && ' (converted from ft²)'}
          </div>
        )}
      </div>

      {/* Phase Selection */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Project Phases *</Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className={`p-4 cursor-pointer transition-all duration-200 ${
              data.phases.includes('casting') 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handlePhaseToggle('casting')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Casting Phase</h3>
                <p className="text-sm text-muted-foreground">18,926 UGX/m²</p>
              </div>
              {data.phases.includes('casting') && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all duration-200 ${
              data.phases.includes('grinding') 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handlePhaseToggle('grinding')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Grinding Phase</h3>
                <p className="text-sm text-muted-foreground">8,043 UGX/m²</p>
              </div>
              {data.phases.includes('grinding') && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </div>
          </Card>
        </div>

        {data.phases.length === 2 && (
          <Badge variant="secondary" className="text-success">
            Both Phases: 26,969 UGX/m² (Discounted Rate)
          </Badge>
        )}
      </div>

      {/* Live Calculation */}
      {data.area > 0 && data.phases.length > 0 && (
        <Card className="p-4 bg-gradient-accent/10 border-accent/20">
          <div className="space-y-2">
            <h3 className="font-semibold text-accent-foreground">Live Calculation</h3>
            <div className="text-sm space-y-1">
              <div>Area: {getAreaInSqm().toFixed(2)} m²</div>
              <div>Rate: {formatCurrency(getPhaseRate())}/m²</div>
              <div>Selected: {data.phases.join(' + ')}</div>
            </div>
            <div className="text-xl font-bold text-accent-foreground">
              Total: {formatCurrency(calculateTotal())}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};