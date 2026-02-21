import { useState } from 'react';
import { useAdminConfig, type AdminConfig } from '@/lib/usePricingConfig';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/pricingConfig';
import { ArrowLeft, Save, RotateCcw, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { config, save, reset } = useAdminConfig();
  const [draft, setDraft] = useState<AdminConfig>(structuredClone(config));

  const updateStyleRate = (index: number, field: 'materialsRate' | 'labourRate', value: string) => {
    const num = parseInt(value) || 0;
    setDraft(prev => {
      const updated = structuredClone(prev);
      updated.styles[index][field] = num;
      return updated;
    });
  };

  const updatePatternMultiplier = (index: number, value: string) => {
    const num = parseFloat(value) || 1;
    setDraft(prev => {
      const updated = structuredClone(prev);
      updated.patterns[index].multiplier = num;
      return updated;
    });
  };

  const handleSave = () => {
    save(draft);
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    reset();
    setDraft(structuredClone({
      styles: [...config.styles],
      patterns: [...config.patterns],
    }));
    // Reload defaults after reset
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                Admin Settings
              </h1>
              <p className="text-sm text-muted-foreground">Adjust pricing rates and pattern multipliers</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Defaults
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Style Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Terrazzo Style Rates (UGX per m²)</CardTitle>
            <CardDescription>Set the base materials and labour rates for each terrazzo style</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Style</TableHead>
                  <TableHead>Materials Rate</TableHead>
                  <TableHead>Labour Rate</TableHead>
                  <TableHead>Full Package</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draft.styles.map((style, i) => (
                  <TableRow key={style.id}>
                    <TableCell className="font-medium">{style.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={style.materialsRate}
                        onChange={(e) => updateStyleRate(i, 'materialsRate', e.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={style.labourRate}
                        onChange={(e) => updateStyleRate(i, 'labourRate', e.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrency(style.materialsRate + style.labourRate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pattern Multipliers */}
        <Card>
          <CardHeader>
            <CardTitle>Pattern Multipliers</CardTitle>
            <CardDescription>Set cost multipliers for each pattern type (1.0 = no change, 1.25 = +25%)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Effect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draft.patterns.map((pattern, i) => (
                  <TableRow key={pattern.id}>
                    <TableCell className="font-medium">{pattern.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.05"
                        min="1"
                        value={pattern.multiplier}
                        onChange={(e) => updatePatternMultiplier(i, e.target.value)}
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {pattern.multiplier === 1 ? 'No change' : `+${Math.round((pattern.multiplier - 1) * 100)}% cost`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
