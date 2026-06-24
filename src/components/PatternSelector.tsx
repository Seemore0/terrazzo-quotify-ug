import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { usePresets } from '@/lib/presetContext';

interface PatternSelectorProps {
  selected: string | null;
  onSelect: (patternId: string) => void;
}

export const PatternSelector = ({ selected, onSelect }: PatternSelectorProps) => {
  const { activePreset } = usePresets();
  const patterns = activePreset.config.patterns.filter(p => p.active).sort((a, b) => a.sort - b.sort);

  if (patterns.length === 0) {
    return <p className="text-muted-foreground">No active patterns in the current preset. Add some in /admin.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Pattern</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map((pattern) => (
          <Card
            key={pattern.id}
            className={`p-5 cursor-pointer transition-all duration-200 ${
              selected === pattern.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
            onClick={() => onSelect(pattern.id)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{pattern.name}</h3>
                <p className="text-sm text-muted-foreground">{pattern.description}</p>
                {pattern.multiplier !== 1 && (
                  <Badge variant="secondary" className="mt-2">
                    {pattern.multiplier > 1 ? '+' : ''}{Math.round((pattern.multiplier - 1) * 100)}% cost
                  </Badge>
                )}
              </div>
              {selected === pattern.id && <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
