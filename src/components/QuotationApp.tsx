import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, FileText, Copy, Share2 } from 'lucide-react';
import { ClientInfoForm } from './ClientInfoForm';
import { ProjectDetailsForm } from './ProjectDetailsForm';
import { QuotationDisplay } from './QuotationDisplay';
import { useToast } from '@/hooks/use-toast';

interface ClientData {
  name: string;
  phone: string;
  location: string;
  date: string;
}

interface ProjectData {
  area: number;
  unit: 'sqm' | 'sqft';
  phases: ('casting' | 'grinding')[];
}

const PRICING_RATES = {
  casting: 18926, // UGX per m²
  grinding: 8043, // UGX per m²
  both: 26969 // UGX per m²
};

const QuotationApp = () => {
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    phone: '',
    location: '',
    date: new Date().toLocaleDateString()
  });

  const [projectData, setProjectData] = useState<ProjectData>({
    area: 0,
    unit: 'sqm',
    phases: []
  });

  const [showQuotation, setShowQuotation] = useState(false);
  const { toast } = useToast();

  const calculateTotal = () => {
    const areaInSqm = projectData.unit === 'sqft' 
      ? projectData.area * 0.0929 
      : projectData.area;

    let rate = 0;
    if (projectData.phases.length === 2) {
      rate = PRICING_RATES.both;
    } else if (projectData.phases.includes('casting')) {
      rate = PRICING_RATES.casting;
    } else if (projectData.phases.includes('grinding')) {
      rate = PRICING_RATES.grinding;
    }

    return areaInSqm * rate;
  };

  const handleGenerateQuote = () => {
    if (!clientData.name || !clientData.phone || !clientData.location) {
      toast({
        title: "Missing Client Information",
        description: "Please fill in all client details",
        variant: "destructive"
      });
      return;
    }

    if (projectData.area <= 0) {
      toast({
        title: "Invalid Area",
        description: "Please enter a valid project area",
        variant: "destructive"
      });
      return;
    }

    if (projectData.phases.length === 0) {
      toast({
        title: "No Phase Selected",
        description: "Please select at least one project phase",
        variant: "destructive"
      });
      return;
    }

    setShowQuotation(true);
    toast({
      title: "Quotation Generated",
      description: "Professional quotation ready for client",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' UGX';
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Terrazzo Quotation Pro
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Professional quotations for Terrazzo flooring projects in Uganda
          </p>
        </div>

        {!showQuotation ? (
          <div className="space-y-6">
            {/* Client Information */}
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Client Information
              </h2>
              <ClientInfoForm 
                data={clientData} 
                onChange={setClientData} 
              />
            </Card>

            {/* Project Details */}
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Project Details
              </h2>
              <ProjectDetailsForm 
                data={projectData} 
                onChange={setProjectData} 
                formatCurrency={formatCurrency}
                calculateTotal={calculateTotal}
              />
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button 
                onClick={handleGenerateQuote}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-3"
              >
                Generate Professional Quotation
              </Button>
            </div>
          </div>
        ) : (
          <QuotationDisplay
            clientData={clientData}
            projectData={projectData}
            total={calculateTotal()}
            formatCurrency={formatCurrency}
            onBack={() => setShowQuotation(false)}
          />
        )}
      </div>
    </div>
  );
};

export default QuotationApp;