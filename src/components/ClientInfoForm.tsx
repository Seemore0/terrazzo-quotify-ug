import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientData {
  name: string;
  phone: string;
  location: string;
  date: string;
}

interface ClientInfoFormProps {
  data: ClientData;
  onChange: (data: ClientData) => void;
}

export const ClientInfoForm = ({ data, onChange }: ClientInfoFormProps) => {
  const handleChange = (field: keyof ClientData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="clientName">Client Name *</Label>
        <Input
          id="clientName"
          type="text"
          placeholder="Enter client full name"
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="shadow-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientPhone">Phone Number *</Label>
        <Input
          id="clientPhone"
          type="tel"
          placeholder="+256 xxx xxx xxx"
          value={data.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="shadow-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="projectLocation">Project Location *</Label>
        <Input
          id="projectLocation"
          type="text"
          placeholder="Enter project address"
          value={data.location}
          onChange={(e) => handleChange('location', e.target.value)}
          className="shadow-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="projectDate">Project Date</Label>
        <Input
          id="projectDate"
          type="date"
          value={data.date}
          onChange={(e) => handleChange('date', e.target.value)}
          className="shadow-input bg-muted"
          readOnly
        />
      </div>
    </div>
  );
};