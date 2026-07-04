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
  const isDirty = JSON.stringify(draft) !== JSON.stringify(activePreset.config);

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
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 truncate">
                <Settings className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />
                Admin Settings
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Manage pricing presets, styles, patterns, materials & formulas</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => { signOut(); navigate('/'); }}>
              <LogOut className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Sign out</span>
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
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-lg md:text-2xl truncate">{activePreset.name}</CardTitle>
              <CardDescription className="text-xs md:text-sm">Edit-in-place. Click "Save changes" to persist.</CardDescription>
            </div>
            <Button
              onClick={handleSave}
              disabled={!canSave || saving || !isDirty}
              size="sm"
              className="gap-2 hidden sm:inline-flex self-start sm:self-auto"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <Tabs defaultValue="styles" className="w-full">
              <div className="-mx-3 sm:mx-0 overflow-x-auto scrollbar-none">
                <TabsList className="inline-flex sm:grid sm:grid-cols-5 w-max sm:w-full min-w-full px-3 sm:px-0 gap-1">
                  <TabsTrigger value="styles" className="shrink-0">Styles</TabsTrigger>
                  <TabsTrigger value="patterns" className="shrink-0">Patterns</TabsTrigger>
                  <TabsTrigger value="prices-c" className="shrink-0">Casting Prices</TabsTrigger>
                  <TabsTrigger value="prices-g" className="shrink-0">Grinding Prices</TabsTrigger>
                  <TabsTrigger value="formulas" className="shrink-0">Formulas</TabsTrigger>
                </TabsList>
              </div>

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

      {/* Mobile sticky save bar (only when dirty) */}
      {canSave && isDirty && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg">
          <Button onClick={handleSave} disabled={saving} className="w-full gap-2 h-11">
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
