import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Plane, DollarSign, Users, MapPin, Building2 } from 'lucide-react';
import { AirlineData } from '@/hooks/useAirlines';

interface AirlineFormProps {
  airline?: AirlineData;
  onSubmit: (data: Omit<AirlineData, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const categories = [
  'Majors',
  'Ultra Low Cost Carriers & Large Operators',
  'Regional Carriers',
  'Fractional Carriers',
  'Cargo'
];

export function AirlineForm({ airline, onSubmit, onCancel, isSubmitting = false }: AirlineFormProps) {
  const [formData, setFormData] = useState({
    name: airline?.name || '',
    call_sign: airline?.call_sign || '',
    pilot_group_size: airline?.pilot_group_size || '',
    fleet_size: airline?.fleet_size || 0,
    description: airline?.description || '',
    pilot_union: airline?.pilot_union || '',
    category: airline?.category || 'Majors',
    is_hiring: airline?.is_hiring || false,
    application_url: airline?.application_url || '',
    most_junior_base: airline?.most_junior_base || '',
    most_junior_captain_hire_date: airline?.most_junior_captain_hire_date || '',
    retirements_in_2025: airline?.retirements_in_2025 || 0,
    fo_pay_year_1: airline?.fo_pay_year_1 || '',
    fo_pay_year_5: airline?.fo_pay_year_5 || '',
    fo_pay_year_10: airline?.fo_pay_year_10 || '',
    captain_pay_year_1: airline?.captain_pay_year_1 || '',
    captain_pay_year_5: airline?.captain_pay_year_5 || '',
    captain_pay_year_10: airline?.captain_pay_year_10 || '',
    fleet_info: airline?.fleet_info || [{ type: '', quantity: 1 }],
    bases: airline?.bases || [''],
    required_qualifications: airline?.required_qualifications || [''],
    preferred_qualifications: airline?.preferred_qualifications || [''],
    inside_scoop: airline?.inside_scoop || [''],
    additional_info: airline?.additional_info || [''],
  });

  const formatPayValue = (value: string) => {
    if (!value) return '';
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (!numericValue) return '';
    
    // Format as currency
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';
    
    return `$${number.toFixed(2)}/hr`;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayInputBlur = (field: string, value: string) => {
    if (value.trim() !== '') {
      const formattedValue = formatPayValue(value);
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const handleFleetChange = (index: number, field: 'type' | 'quantity', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      fleet_info: prev.fleet_info.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (field: string, defaultValue: any = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as any[]), defaultValue]
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up all pay fields to ensure consistent formatting
    const cleanedFormData = { ...formData };
    
    // Process all pay fields for consistent formatting
    for (let year = 1; year <= 10; year++) {
      const foField = `fo_pay_year_${year}`;
      const captainField = `captain_pay_year_${year}`;
      
      if ((cleanedFormData as any)[foField]) {
        const value = (cleanedFormData as any)[foField] as string;
        if (value.trim() && !value.includes('/hr')) {
          (cleanedFormData as any)[foField] = formatPayValue(value);
        }
      }
      
      if ((cleanedFormData as any)[captainField]) {
        const value = (cleanedFormData as any)[captainField] as string;
        if (value.trim() && !value.includes('/hr')) {
          (cleanedFormData as any)[captainField] = formatPayValue(value);
        }
      }
    }

    const filteredData = {
      ...cleanedFormData,
      logo: '✈️',
      active: true,
      bases: cleanedFormData.bases.filter(base => base.trim() !== ''),
      required_qualifications: cleanedFormData.required_qualifications.filter(qual => qual.trim() !== ''),
      preferred_qualifications: cleanedFormData.preferred_qualifications.filter(qual => qual.trim() !== ''),
      inside_scoop: cleanedFormData.inside_scoop.filter(scoop => scoop.trim() !== ''),
      additional_info: cleanedFormData.additional_info.filter(info => info.trim() !== ''),
    };

    await onSubmit(filteredData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Airline Name *</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="call_sign">Call Sign *</Label>
              <Input 
                id="call_sign" 
                value={formData.call_sign}
                onChange={(e) => handleInputChange('call_sign', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pilot_group_size">Pilot Group Size *</Label>
              <Input 
                id="pilot_group_size" 
                placeholder="e.g., 3,200+" 
                value={formData.pilot_group_size}
                onChange={(e) => handleInputChange('pilot_group_size', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fleet_size">Fleet Size *</Label>
              <Input 
                id="fleet_size" 
                type="number" 
                min="0"
                value={formData.fleet_size}
                onChange={(e) => handleInputChange('fleet_size', parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pilot_union">Pilot Union *</Label>
              <Input 
                id="pilot_union" 
                placeholder="e.g., ALPA" 
                value={formData.pilot_union}
                onChange={(e) => handleInputChange('pilot_union', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea 
              id="description" 
              rows={3} 
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Fleet Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Fleet Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.fleet_info.map((fleet, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label>Aircraft Type</Label>
                <Input 
                  placeholder="e.g., Boeing 737-800" 
                  value={fleet.type}
                  onChange={(e) => handleFleetChange(index, 'type', e.target.value)}
                />
              </div>
              <div className="w-24 space-y-2">
                <Label>Quantity</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={fleet.quantity}
                  onChange={(e) => handleFleetChange(index, 'quantity', parseInt(e.target.value) || 1)}
                />
              </div>
              {formData.fleet_info.length > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => removeArrayItem('fleet_info', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addArrayItem('fleet_info', { type: '', quantity: 1 })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Aircraft
          </Button>
        </CardContent>
      </Card>

      {/* Operating Bases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Operating Bases
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.bases.map((base, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input 
                placeholder="e.g., Seattle (SEA)" 
                className="flex-1"
                value={base}
                onChange={(e) => handleArrayChange('bases', index, e.target.value)}
              />
              {formData.bases.length > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => removeArrayItem('bases', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addArrayItem('bases')}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Base
          </Button>
        </CardContent>
      </Card>

      {/* Hiring Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Hiring Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_hiring}
              onCheckedChange={(checked) => handleInputChange('is_hiring', checked)}
            />
            <Label>Currently Hiring</Label>
          </div>
          
          {formData.is_hiring && (
            <div className="space-y-2">
              <Label htmlFor="application_url">Application URL</Label>
              <Input 
                id="application_url" 
                type="url" 
                value={formData.application_url}
                onChange={(e) => handleInputChange('application_url', e.target.value)}
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Required Qualifications</Label>
              <div className="space-y-2 mt-2">
                {formData.required_qualifications.map((qual, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      placeholder="e.g., Minimum 1,500 hours total time"
                      className="flex-1"
                      value={qual}
                      onChange={(e) => handleArrayChange('required_qualifications', index, e.target.value)}
                    />
                    {formData.required_qualifications.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => removeArrayItem('required_qualifications', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('required_qualifications')}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Required Qualification
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Preferred Qualifications</Label>
              <div className="space-y-2 mt-2">
                {formData.preferred_qualifications.map((qual, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      placeholder="e.g., Bachelor's degree"
                      className="flex-1"
                      value={qual}
                      onChange={(e) => handleArrayChange('preferred_qualifications', index, e.target.value)}
                    />
                    {formData.preferred_qualifications.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => removeArrayItem('preferred_qualifications', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('preferred_qualifications')}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Preferred Qualification
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Inside Scoop</Label>
              <div className="space-y-2 mt-2">
                {formData.inside_scoop.map((scoop, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      placeholder="e.g., Known for excellent work-life balance"
                      className="flex-1"
                      value={scoop}
                      onChange={(e) => handleArrayChange('inside_scoop', index, e.target.value)}
                    />
                    {formData.inside_scoop.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => removeArrayItem('inside_scoop', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('inside_scoop')}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inside Scoop
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seniority & Pay Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Seniority & Pay Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="most_junior_base">Most Junior Base</Label>
              <Input 
                id="most_junior_base" 
                value={formData.most_junior_base}
                onChange={(e) => handleInputChange('most_junior_base', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="most_junior_captain_hire_date">Most Jr Captain Hire Date</Label>
              <Input 
                id="most_junior_captain_hire_date" 
                value={formData.most_junior_captain_hire_date}
                onChange={(e) => handleInputChange('most_junior_captain_hire_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retirements_in_2025">Retirements in 2025</Label>
              <Input 
                id="retirements_in_2025" 
                type="number" 
                min="0"
                value={formData.retirements_in_2025}
                onChange={(e) => handleInputChange('retirements_in_2025', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Pay Scales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">First Officer Pay</h4>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                  <Input 
                    key={year}
                    placeholder={`Year ${year} (e.g., 120.50)`}
                    value={(formData as any)[`fo_pay_year_${year}`] || ''}
                    onChange={(e) => handleInputChange(`fo_pay_year_${year}`, e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        handlePayInputBlur(`fo_pay_year_${year}`, e.target.value);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Captain Pay</h4>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                  <Input 
                    key={year}
                    placeholder={`Year ${year} (e.g., 300.50)`}
                    value={(formData as any)[`captain_pay_year_${year}`] || ''}
                    onChange={(e) => handleInputChange(`captain_pay_year_${year}`, e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        handlePayInputBlur(`captain_pay_year_${year}`, e.target.value);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.additional_info.map((info, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input 
                placeholder="e.g., Industry-leading pilot contract ratified in 2022"
                className="flex-1"
                value={info}
                onChange={(e) => handleArrayChange('additional_info', index, e.target.value)}
              />
              {formData.additional_info.length > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => removeArrayItem('additional_info', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addArrayItem('additional_info')}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Additional Info
          </Button>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : airline ? 'Update Airline' : 'Create Airline'}
        </Button>
      </div>
    </form>
  );
}