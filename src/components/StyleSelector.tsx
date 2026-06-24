import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { usePresets } from '@/lib/presetContext';
import { formatCurrency, type WorkMode } from '@/lib/presetTypes';

interface StyleSelectorProps {
  selected: string | null;
  workMode: WorkMode | null;
  onSelect: (styleId: string) => void;
}

export const StyleSelector = ({ selected, workMode, onSelect }: StyleSelectorProps) => {
  const { activePreset } = usePresets();
  const styles = activePreset.config.styles.filter(s => s.active).sort((a, b) => a.sort - b.sort);

  const getDisplayRate = (style: typeof styles[0]) => {
    if (workMode === 'materials') return formatCurrency(style.materialsRate);
    if (workMode === 'labour') return formatCurrency(style.labourRate);
    return formatCurrency(style.materialsRate + style.labourRate);
  };

  if (styles.length === 0) {
    return <p className="text-muted-foreground">No active styles in the current preset. Add some in /admin.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Terrazzo Style</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {styles.map((style) => (
          <Card
            key={style.id}
            className={`p-5 cursor-pointer transition-all duration-200 ${
              selected === style.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
            onClick={() => onSelect(style.id)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{style.name}</h3>
                <p className="text-sm text-muted-foreground">{style.description}</p>
                <p className="text-sm font-medium text-primary mt-2">{getDisplayRate(style)}/m²</p>
              </div>
              {selected === style.id && <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
