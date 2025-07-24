import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Share2, Download, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

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

interface QuotationDisplayProps {
  clientData: ClientData;
  projectData: ProjectData;
  total: number;
  formatCurrency: (amount: number) => string;
  onBack: () => void;
}

const MATERIAL_UNIT_PRICES = {
  casting: {
    'Stones floor white': { unit: 'bag', price: 15000 },
    'Stones floor black': { unit: 'bag', price: 13000 },
    'Stones floor red': { unit: 'bag', price: 13000 },
    'Stones skirting white': { unit: 'bag', price: 15000 },
    'Stones skirting black': { unit: 'bag', price: 13000 },
    'Stones skirting red': { unit: 'bag', price: 13000 },
    'Stips': { unit: 'bundle', price: 60000 },
    'Soft brush': { unit: 'each', price: 12000 },
    'Black oxide': { unit: 'kg', price: 15000 },
    'Concrete nails': { unit: 'box', price: 5000 },
    'Wooden strips': { unit: 'each', price: 1000 },
    'Ordinary cement': { unit: 'bag', price: 33000 },
    'White cement': { unit: 'bag', price: 65000 }
  },
  grinding: {
    'Big machine diamond pads': { unit: 'set', price: 150000 },
    'Grinder diamond pads': { unit: 'piece', price: 60000 },
    'Pads 50 grit': { unit: 'pad', price: 20000 },
    'Pads 100 grit': { unit: 'pad', price: 20000 },
    'Pads 200 grit': { unit: 'pad', price: 20000 },
    'Pads 300 grit': { unit: 'pad', price: 20000 },
    'Pads 400 grit': { unit: 'pad', price: 20000 },
    'Pads 500 grit': { unit: 'pad', price: 20000 },
    'Grinder pad holder': { unit: 'each', price: 15000 },
    'Machine pad holder': { unit: 'each', price: 15000 },
    'Squeezer': { unit: 'each', price: 10000 },
    'Polish': { unit: 'liter', price: 20000 },
    'Maintainer': { unit: 'liter', price: 10000 }
  }
};

export const QuotationDisplay = ({ 
  clientData, 
  projectData, 
  total, 
  formatCurrency, 
  onBack 
}: QuotationDisplayProps) => {
  const [showMaterials, setShowMaterials] = useState(false);
  const { toast } = useToast();

  const getAreaInSqm = () => {
    return projectData.unit === 'sqft' ? projectData.area * 0.0929 : projectData.area;
  };

  const calculateCastingMaterials = (area: number) => {
    // Stones (Floor)
    const totalStones = area / 2;
    const whiteStones = totalStones * (5 / 7);
    const coloredStones = totalStones * (2 / 7);
    const blackStones = coloredStones * (14 / 24);
    const redStones = coloredStones * (10 / 24);

    // Stones (Skirting)
    const totalSkirtingStones = area / 3.33;
    const whiteSkirtingStones = totalSkirtingStones * (5 / 7);
    const coloredSkirtingStones = totalSkirtingStones * (2 / 7);
    const blackSkirtingStones = coloredSkirtingStones * (11 / 24);
    const redSkirtingStones = coloredSkirtingStones * (4 / 24);

    // Cement
    const ordinaryCement = totalStones / 2;
    const whiteCement = area / 8;

    // Other Materials
    const woodenStrips = area / 2.67;
    const stips = area / 26.67;
    const softBrush = area / 16;
    const blackOxide = area * 0.25;
    const concreteNails = area / 26.67;

    return [
      { item: 'Stones floor white', quantity: `${Math.ceil(whiteStones)} bags`, price: MATERIAL_UNIT_PRICES.casting['Stones floor white'].price, total: Math.ceil(whiteStones) * MATERIAL_UNIT_PRICES.casting['Stones floor white'].price },
      { item: 'Stones floor black', quantity: `${Math.ceil(blackStones)} bags`, price: MATERIAL_UNIT_PRICES.casting['Stones floor black'].price, total: Math.ceil(blackStones) * MATERIAL_UNIT_PRICES.casting['Stones floor black'].price },
      { item: 'Stones floor red', quantity: `${Math.ceil(redStones)} bags`, price: MATERIAL_UNIT_PRICES.casting['Stones floor red'].price, total: Math.ceil(redStones) * MATERIAL_UNIT_PRICES.casting['Stones floor red'].price },
      { item: 'Stones skirting white', quantity: `${Math.ceil(whiteSkirtingStones)} bags`, price: MATERIAL_UNIT_PRICES.casting['Stones skirting white'].price, total: Math.ceil(whiteSkirtingStones) * MATERIAL_UNIT_PRICES.casting['Stones skirting white'].price },
      { item: 'Stones skirting black', quantity: `${Math.ceil(blackSkirtingStones)} bags`, price: MATERIAL_UNIT_PRICES.casting['Stones skirting black'].price, total: Math.ceil(blackSkirtingStones) * MATERIAL_UNIT_PRICES.casting['Stones skirting black'].price },
      { item: 'Stones skirting red', quantity: `${Math.ceil(redSkirtingStones)} bags`, price: MATERIAL_UNIT_PRICES.casting['Stones skirting red'].price, total: Math.ceil(redSkirtingStones) * MATERIAL_UNIT_PRICES.casting['Stones skirting red'].price },
      { item: 'Stips', quantity: `${Math.ceil(stips)} bundles`, price: MATERIAL_UNIT_PRICES.casting['Stips'].price, total: Math.ceil(stips) * MATERIAL_UNIT_PRICES.casting['Stips'].price },
      { item: 'Soft brush', quantity: `${Math.ceil(softBrush)}`, price: MATERIAL_UNIT_PRICES.casting['Soft brush'].price, total: Math.ceil(softBrush) * MATERIAL_UNIT_PRICES.casting['Soft brush'].price },
      { item: 'Black oxide', quantity: `${Math.ceil(blackOxide)} kg`, price: MATERIAL_UNIT_PRICES.casting['Black oxide'].price, total: Math.ceil(blackOxide) * MATERIAL_UNIT_PRICES.casting['Black oxide'].price },
      { item: 'Concrete nails', quantity: `${Math.ceil(concreteNails)} boxes`, price: MATERIAL_UNIT_PRICES.casting['Concrete nails'].price, total: Math.ceil(concreteNails) * MATERIAL_UNIT_PRICES.casting['Concrete nails'].price },
      { item: 'Wooden strips', quantity: `${Math.ceil(woodenStrips)}`, price: MATERIAL_UNIT_PRICES.casting['Wooden strips'].price, total: Math.ceil(woodenStrips) * MATERIAL_UNIT_PRICES.casting['Wooden strips'].price },
      { item: 'Ordinary cement', quantity: `${Math.ceil(ordinaryCement)} bags`, price: MATERIAL_UNIT_PRICES.casting['Ordinary cement'].price, total: Math.ceil(ordinaryCement) * MATERIAL_UNIT_PRICES.casting['Ordinary cement'].price },
      { item: 'White cement', quantity: `${Math.ceil(whiteCement)} bags`, price: MATERIAL_UNIT_PRICES.casting['White cement'].price, total: Math.ceil(whiteCement) * MATERIAL_UNIT_PRICES.casting['White cement'].price }
    ];
  };

  const calculateGrindingMaterials = (area: number) => {
    const bigMachineDiamondPads = area / 115;
    const grinderDiamondPads = area / 115;
    const pads50Grit = area / 77;
    const pads100to400Grit = area / 115;
    const pads500Grit = area / 230;
    const grinderPadHolders = area / 57.5;
    const machinePadHolders = area / 57.5;
    const squeezer = area / 76.7;
    const polish = area * 0.087;
    const maintainer = area * 0.174;

    return [
      { item: 'Big machine diamond pads', quantity: `${Math.ceil(bigMachineDiamondPads)} sets`, price: MATERIAL_UNIT_PRICES.grinding['Big machine diamond pads'].price, total: Math.ceil(bigMachineDiamondPads) * MATERIAL_UNIT_PRICES.grinding['Big machine diamond pads'].price },
      { item: 'Grinder diamond pads', quantity: `${Math.ceil(grinderDiamondPads)} pcs`, price: MATERIAL_UNIT_PRICES.grinding['Grinder diamond pads'].price, total: Math.ceil(grinderDiamondPads) * MATERIAL_UNIT_PRICES.grinding['Grinder diamond pads'].price },
      { item: 'Pads 50 grit', quantity: `${Math.ceil(pads50Grit)}`, price: MATERIAL_UNIT_PRICES.grinding['Pads 50 grit'].price, total: Math.ceil(pads50Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 50 grit'].price },
      { item: 'Pads 100 grit', quantity: `${Math.ceil(pads100to400Grit)}`, price: MATERIAL_UNIT_PRICES.grinding['Pads 100 grit'].price, total: Math.ceil(pads100to400Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 100 grit'].price },
      { item: 'Pads 200 grit', quantity: `${Math.ceil(pads100to400Grit)}`, price: MATERIAL_UNIT_PRICES.grinding['Pads 200 grit'].price, total: Math.ceil(pads100to400Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 200 grit'].price },
      { item: 'Pads 300 grit', quantity: `${Math.ceil(pads100to400Grit)}`, price: MATERIAL_UNIT_PRICES.grinding['Pads 300 grit'].price, total: Math.ceil(pads100to400Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 300 grit'].price },
      { item: 'Pads 400 grit', quantity: `${Math.ceil(pads100to400Grit)}`, price: MATERIAL_UNIT_PRICES.grinding['Pads 400 grit'].price, total: Math.ceil(pads100to400Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 400 grit'].price },
      { item: 'Pads 500 grit', quantity: `${Math.ceil(pads500Grit)}`, price: MATERIAL_UNIT_PRICES.grinding['Pads 500 grit'].price, total: Math.ceil(pads500Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 500 grit'].price },
      { item: 'Grinder pad holder', quantity: `${Math.ceil(grinderPadHolders)}`, price: MATERIAL_UNIT_PRICES.grinding['Grinder pad holder'].price, total: Math.ceil(grinderPadHolders) * MATERIAL_UNIT_PRICES.grinding['Grinder pad holder'].price },
      { item: 'Machine pad holder', quantity: `${Math.ceil(machinePadHolders)}`, price: MATERIAL_UNIT_PRICES.grinding['Machine pad holder'].price, total: Math.ceil(machinePadHolders) * MATERIAL_UNIT_PRICES.grinding['Machine pad holder'].price },
      { item: 'Squeezer', quantity: `${Math.ceil(squeezer)}`, price: MATERIAL_UNIT_PRICES.grinding['Squeezer'].price, total: Math.ceil(squeezer) * MATERIAL_UNIT_PRICES.grinding['Squeezer'].price },
      { item: 'Polish', quantity: `${Math.ceil(polish)} L`, price: MATERIAL_UNIT_PRICES.grinding['Polish'].price, total: Math.ceil(polish) * MATERIAL_UNIT_PRICES.grinding['Polish'].price },
      { item: 'Maintainer', quantity: `${Math.ceil(maintainer)} L`, price: MATERIAL_UNIT_PRICES.grinding['Maintainer'].price, total: Math.ceil(maintainer) * MATERIAL_UNIT_PRICES.grinding['Maintainer'].price }
    ];
  };

  const getMaterialBreakdown = (phase: 'casting' | 'grinding') => {
    const area = getAreaInSqm();
    return phase === 'casting' ? calculateCastingMaterials(area) : calculateGrindingMaterials(area);
  };

  const getQuoteText = () => {
    const area = getAreaInSqm();
    const phases = projectData.phases.join(' + ');
    
    return `
TERRAZZO QUOTATION PRO
========================

CLIENT DETAILS:
Name: ${clientData.name}
Phone: ${clientData.phone}
Location: ${clientData.location}
Date: ${clientData.date}

PROJECT DETAILS:
Area: ${area.toFixed(2)} m²
Phases: ${phases}
Total: ${formatCurrency(total)}

Generated by Terrazzo Quotation Pro
    `.trim();
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getQuoteText());
      toast({
        title: "Copied to Clipboard",
        description: "Quotation text copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    const text = getQuoteText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const area = getAreaInSqm();
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('TERRAZZO QUOTATION PRO', 105, 20, { align: 'center' });
    
    // Client Details
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('CLIENT DETAILS:', 20, 40);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${clientData.name}`, 20, 50);
    doc.text(`Phone: ${clientData.phone}`, 20, 60);
    doc.text(`Location: ${clientData.location}`, 20, 70);
    doc.text(`Date: ${clientData.date}`, 20, 80);
    
    // Project Details
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('PROJECT DETAILS:', 20, 100);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Area: ${area.toFixed(2)} m²`, 20, 110);
    doc.text(`Phases: ${projectData.phases.join(' + ')}`, 20, 120);
    
    // Total
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('GRAND TOTAL:', 20, 140);
    doc.text(formatCurrency(total), 20, 155);
    
    // Material Breakdown if shown
    if (showMaterials) {
      let yPos = 175;
      
      projectData.phases.forEach(phase => {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase Materials:`, 20, yPos);
        yPos += 15;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        getMaterialBreakdown(phase).forEach(material => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${material.item} - ${material.quantity} - ${formatCurrency(material.total)}`, 20, yPos);
          yPos += 8;
        });
        
        yPos += 10;
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('Generated by Terrazzo Quotation Pro', 105, doc.internal.pageSize.height - 10, { align: 'center' });
    
    // Save the PDF
    doc.save(`Terrazzo_Quote_${clientData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: "Professional quotation PDF saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Form
        </Button>
        <h2 className="text-2xl font-bold">Professional Quotation</h2>
      </div>

      {/* Quotation Card */}
      <Card className="p-8 shadow-elevated">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            TERRAZZO QUOTATION PRO
          </h1>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded"></div>
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-4 text-primary">Client Details</h3>
            <div className="space-y-2">
              <div><span className="font-medium">Name:</span> {clientData.name}</div>
              <div><span className="font-medium">Phone:</span> {clientData.phone}</div>
              <div><span className="font-medium">Location:</span> {clientData.location}</div>
              <div><span className="font-medium">Date:</span> {clientData.date}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 text-primary">Project Details</h3>
            <div className="space-y-2">
              <div><span className="font-medium">Area:</span> {getAreaInSqm().toFixed(2)} m²</div>
              <div><span className="font-medium">Phases:</span> {projectData.phases.join(' + ')}</div>
              <div className="flex gap-2 mt-2">
                {projectData.phases.map(phase => (
                  <Badge key={phase} variant="secondary">
                    {phase.charAt(0).toUpperCase() + phase.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-primary/10 p-6 rounded-lg mb-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary mb-2">
              GRAND TOTAL
            </h3>
            <div className="text-4xl font-bold text-primary">
              {formatCurrency(total)}
            </div>
            <p className="text-muted-foreground mt-2">
              All inclusive professional terrazzo work
            </p>
          </div>
        </div>

        {/* Material Breakdown Toggle */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowMaterials(!showMaterials)}
            className="w-full"
          >
            {showMaterials ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showMaterials ? 'Hide' : 'Show'} Material Breakdown
          </Button>
        </div>

        {/* Material Breakdown */}
        {showMaterials && (
          <div className="space-y-6 mb-8">
            {projectData.phases.map(phase => (
              <div key={phase}>
                <h4 className="font-semibold text-lg mb-3 text-primary capitalize">
                  {phase} Phase Materials
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Item</th>
                        <th className="text-left p-3">Quantity</th>
                        <th className="text-right p-3">Price (UGX)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getMaterialBreakdown(phase).map((material, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{material.item}</td>
                          <td className="p-3">{material.quantity}</td>
                          <td className="p-3 text-right">{formatCurrency(material.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleCopyToClipboard} variant="outline" className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copy to Clipboard
          </Button>
          
          <Button onClick={handleShare} className="flex-1 bg-success hover:bg-success/90">
            <Share2 className="h-4 w-4 mr-2" />
            Share on WhatsApp
          </Button>
          
          <Button variant="outline" className="flex-1" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </Card>
    </div>
  );
};