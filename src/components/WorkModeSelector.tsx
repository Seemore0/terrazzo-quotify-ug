import { Card } from '@/components/ui/card';
import { type WorkMode, WORK_MODES } from '@/lib/presetTypes';
import { CheckCircle, Package, Wrench, Layers } from 'lucide-react';

const ICONS: Record<WorkMode, React.ReactNode> = {
  materials: <Package className="h-6 w-6" />,
  labour: <Wrench className="h-6 w-6" />,
  full: <Layers className="h-6 w-6" />,
};

interface WorkModeSelectorProps {
  selected: WorkMode | null;
  onSelect: (mode: WorkMode) => void;
}

export const WorkModeSelector = ({ selected, onSelect }: WorkModeSelectorProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Work Mode</h2>
      <div className="grid grid-cols-1 gap-4">
        {WORK_MODES.map((mode) => (
          <Card
            key={mode.id}
            className={`p-5 cursor-pointer transition-all duration-200 ${
              selected === mode.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
            onClick={() => onSelect(mode.id)}
          >
            <div className="flex items-center gap-4">
              <div className="text-primary">{ICONS[mode.id]}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{mode.name}</h3>
                <p className="text-sm text-muted-foreground">{mode.description}</p>
              </div>
              {selected === mode.id && <CheckCircle className="h-5 w-5 text-primary shrink-0" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
