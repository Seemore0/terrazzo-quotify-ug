import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Save, Settings, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePresets } from '@/lib/presetContext';
import { PresetSwitcher } from '@/components/admin/PresetSwitcher';
import { StylesEditor } from '@/components/admin/StylesEditor';
import { PatternsEditor } from '@/components/admin/PatternsEditor';
import { MaterialsEditor } from '@/components/admin/MaterialsEditor';
import type { PresetConfig } from '@/lib/presetTypes';
import { toast } from 'sonner';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading, signOut } = useAuth();
  const { activePreset, saveActiveConfig, dbReady, error } = usePresets();

  const [draft, setDraft] = useState<PresetConfig>(activePreset.config);
  const [saving, setSaving] = useState(false);

  // Reset draft whenever the active preset changes
  useEffect(() => { setDraft(structuredClone(activePreset.config)); }, [activePreset.id, activePreset.config]);

  if (authLoading) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  if (!session) return <Navigate to="/auth?next=/admin" replace />;

  const isBuiltinDefault = activePreset.id.startsWith('builtin-');
  const ownsActive = !!activePreset.owner_id && activePreset.owner_id === session.user.id;
  const canSave = !isBuiltinDefault && ownsActive;

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveActiveConfig(draft);
      toast.success('Saved');
    } catch (e: any) {
      toast.error(e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                Admin Settings
              </h1>
              <p className="text-sm text-muted-foreground">Manage pricing presets, styles, patterns, materials & formulas</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { signOut(); navigate('/'); }}>
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>

        {!dbReady && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Backend setup required</AlertTitle>
            <AlertDescription>
              The <code className="font-mono">pricing_presets</code> table isn't reachable. Open your Supabase dashboard's SQL editor and run the migration in <code className="font-mono">supabase/migrations/20260624000000_pricing_presets.sql</code>. Until then, the app falls back to built-in defaults.
              {error && <div className="mt-2 text-xs opacity-80">{error}</div>}
            </AlertDescription>
          </Alert>
        )}

        {/* Preset switcher */}
        <Card>
          <CardHeader>
            <CardTitle>Active Preset</CardTitle>
            <CardDescription>
              Switch presets to manage a different configuration. Edits below apply to the selected preset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PresetSwitcher manage />
            {isBuiltinDefault && (
              <p className="text-sm text-muted-foreground mt-3">
                The <strong>Default</strong> preset is read-only. Click <strong>Duplicate</strong> to create your own editable copy.
              </p>
            )}
            {!isBuiltinDefault && !ownsActive && (
              <p className="text-sm text-muted-foreground mt-3">You can view this preset but only its owner can edit it.</p>
            )}
          </CardContent>
        </Card>

        {/* Editor tabs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>{activePreset.name}</CardTitle>
              <CardDescription>Edit-in-place. Click "Save changes" to persist.</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={!canSave || saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="styles" className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
                <TabsTrigger value="styles">Styles</TabsTrigger>
                <TabsTrigger value="patterns">Patterns</TabsTrigger>
                <TabsTrigger value="prices-c">Casting Prices</TabsTrigger>
                <TabsTrigger value="prices-g">Grinding Prices</TabsTrigger>
                <TabsTrigger value="formulas">Formulas</TabsTrigger>
              </TabsList>

              <TabsContent value="styles" className="pt-4">
                <StylesEditor rows={draft.styles} onChange={(rows) => setDraft({ ...draft, styles: rows })} />
              </TabsContent>

              <TabsContent value="patterns" className="pt-4">
                <PatternsEditor rows={draft.patterns} onChange={(rows) => setDraft({ ...draft, patterns: rows })} />
              </TabsContent>

              <TabsContent value="prices-c" className="pt-4">
                <MaterialsEditor
                  phase="casting"
                  rows={draft.materials.casting}
                  pricesOnly
                  onChange={(rows) => setDraft({ ...draft, materials: { ...draft.materials, casting: rows } })}
                />
              </TabsContent>

              <TabsContent value="prices-g" className="pt-4">
                <MaterialsEditor
                  phase="grinding"
                  rows={draft.materials.grinding}
                  pricesOnly
                  onChange={(rows) => setDraft({ ...draft, materials: { ...draft.materials, grinding: rows } })}
                />
              </TabsContent>

              <TabsContent value="formulas" className="pt-4 space-y-6">
                <p className="text-sm text-muted-foreground">
                  Each material's quantity is computed from project area. Choose <em>area ÷</em> or <em>area ×</em> and set the factor.
                  Example: <code className="font-mono">area ÷ 2.8</code> means one bag of white floor stones covers 2.8 m².
                </p>
                <div className="space-y-2">
                  <h3 className="font-semibold">Casting phase</h3>
                  <MaterialsEditor
                    phase="casting"
                    rows={draft.materials.casting}
                    onChange={(rows) => setDraft({ ...draft, materials: { ...draft.materials, casting: rows } })}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Grinding phase</h3>
                  <MaterialsEditor
                    phase="grinding"
                    rows={draft.materials.grinding}
                    onChange={(rows) => setDraft({ ...draft, materials: { ...draft.materials, grinding: rows } })}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
