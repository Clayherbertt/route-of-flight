import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAirlines, AirlineData } from '@/hooks/useAirlines';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AirlineForm } from '@/components/forms/AirlineForm';
import Header from '@/components/layout/Header';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  Plane, 
  Users, 
  MapPin,
  ArrowLeft,
  Loader2
} from 'lucide-react';

export default function ManageAirlines() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { airlines, loading, createAirline, updateAirline, deleteAirline } = useAirlines();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAirline, setSelectedAirline] = useState<AirlineData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not admin
  if (!adminLoading && !isAdmin) {
    navigate('/');
    return null;
  }

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Group airlines by category in the same order as public page
  const airlineSections = [
    {
      title: "Majors",
      airlines: airlines.filter(airline => airline.category === "Majors")
    },
    {
      title: "Ultra Low Cost Carriers & Large Operators", 
      airlines: airlines.filter(airline => airline.category === "Ultra Low Cost Carriers & Large Operators")
    },
    {
      title: "Regional Carriers",
      airlines: airlines.filter(airline => airline.category === "Regional Carriers")
    },
    {
      title: "Fractional Carriers",
      airlines: airlines.filter(airline => airline.category === "Fractional Carriers")
    },
    {
      title: "Cargo",
      airlines: airlines.filter(airline => airline.category === "Cargo")
    }
  ];

  // Filter airlines based on search term
  const filteredSections = airlineSections.map(section => ({
    ...section,
    airlines: section.airlines.filter(airline => 
      airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airline.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.airlines.length > 0);

  const handleCreateAirline = () => {
    setSelectedAirline(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditAirline = (airline: AirlineData) => {
    setSelectedAirline(airline);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeleteAirline = async (id: string) => {
    if (confirm('Are you sure you want to deactivate this airline?')) {
      await deleteAirline(id);
    }
  };

  const handleFormSubmit = async (data: Omit<AirlineData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true);
      if (isEditing && selectedAirline) {
        // Remove fields that shouldn't be updated
        const { id, created_at, updated_at, ...updateData } = data as any;
        await updateAirline(selectedAirline.id, updateData);
      } else {
        await createAirline(data);
      }
      setIsFormOpen(false);
      setSelectedAirline(null);
    } catch (error) {
      console.error('Error saving airline:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedAirline(null);
    setIsEditing(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Majors': return 'bg-blue-500/10 text-blue-700 border-blue-200/30';
      case 'Ultra Low Cost Carriers & Large Operators': return 'bg-green-500/10 text-green-700 border-green-200/30';
      case 'Regional Carriers': return 'bg-purple-500/10 text-purple-700 border-purple-200/30';
      case 'Fractional Carriers': return 'bg-amber-500/10 text-amber-700 border-amber-200/30';
      case 'Cargo': return 'bg-orange-500/10 text-orange-700 border-orange-200/30';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                Manage Airlines
              </h1>
              <p className="text-muted-foreground mt-1">
                Add, edit, and manage airline information
              </p>
            </div>
          </div>
          <Button onClick={handleCreateAirline} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Airline
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search airlines by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Airlines</p>
                  <p className="text-2xl font-bold">{airlines.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Currently Hiring</p>
                  <p className="text-2xl font-bold">{airlines.filter(a => a.is_hiring).length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Airlines Sections - Basic Layout */}
        <div className="space-y-6">
          {filteredSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="text-lg font-medium mb-3 border-b pb-2">{section.title}</h2>
              
              <div className="space-y-2">
                {section.airlines.map((airline) => (
                  <div key={airline.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="font-medium">{airline.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({airline.call_sign})</span>
                      </div>
                      {airline.is_hiring && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Hiring</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {airline.fleet_size} aircraft
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAirline(airline)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAirline(airline.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              {searchTerm ? 'No airlines found' : 'No airlines yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search term'
                : 'Get started by adding your first airline'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateAirline}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Airline
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Edit ${selectedAirline?.name}` : 'Add New Airline'}
            </DialogTitle>
          </DialogHeader>
          <AirlineForm
            airline={selectedAirline || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}