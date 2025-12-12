import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Header from '@/components/layout/Header';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard, 
  ArrowLeft,
  Loader2,
  Sparkles
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price_cents: number | null;
  yearly_price_cents: number | null;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
  features: string[];
  limitations: string[];
  created_at: string;
  updated_at: string;
}

export default function ManageSubscriptions() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    monthly_price: '',
    yearly_price: '',
    is_free: false,
    is_active: true,
    sort_order: 0,
    features: '',
    limitations: ''
  });

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && !isAdmin && !hasNavigated) {
      setHasNavigated(true);
      navigate('/');
    }
  }, [adminLoading, isAdmin, navigate, hasNavigated]);

  // Auto-generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load subscription plans',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPlans();
    }
  }, [isAdmin]);

  // Seed default plans function
  const handleSeedDefaults = async () => {
    if (!confirm('This will create the three default plans (Basic, Pro, Pro Plus) if they don\'t exist. Continue?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const defaultPlans = [
        {
          name: 'Basic',
          slug: 'basic',
          description: 'Essential tools to get started with Route of Flight.',
          monthly_price_cents: null,
          yearly_price_cents: null,
          is_free: true,
          is_active: true,
          sort_order: 1,
          features: [
            'Digital logbook with limited entries (3 entries max)',
            'Basic hour tracking',
            'Access to all airline profile pages',
            'Searchable airline hiring requirements',
            'Route Builder access (7-day free trial)',
            'Résumé Builder access (7-day free trial)'
          ],
          limitations: [
            'Limited logbook entries (3 max)',
            'Route Builder locked after 7-day trial',
            'Résumé Builder locked after 7-day trial',
            'No analytics or breakdowns',
            'No cloud sync'
          ]
        },
        {
          name: 'Pro',
          slug: 'pro',
          description: 'Advanced tools for logging, analytics, and route planning.',
          monthly_price_cents: 1200,
          yearly_price_cents: 12900,
          is_free: false,
          is_active: true,
          sort_order: 2,
          features: [
            'Unlimited digital logbook entries',
            'Automatic currency and requirement tracking',
            'Full Route Builder access',
            'Automatic hour syncing into route steps',
            'Hour analytics and detailed breakdowns',
            'Cloud sync and backup',
            'Priority support',
            'Full résumé builder access',
            'Unlimited résumé exports',
            'Premium résumé templates',
            'Guided résumé prompts',
            'Airline-optimized formatting',
            'Manual résumé hour entry (auto-sync available on Pro Plus)'
          ],
          limitations: []
        },
        {
          name: 'Pro Plus',
          slug: 'pro-plus',
          description: 'Includes advanced career tools for applications and résumé building with full feature access.',
          monthly_price_cents: 2000,
          yearly_price_cents: 21600,
          is_free: false,
          is_active: true,
          sort_order: 3,
          features: [
            'Everything in Pro',
            'World / map view of recent flights',
            'Logbook predictions tool (milestone estimator)',
            'Automatic logbook syncing to résumé',
            'Additional analytics for turbine, PIC/SIC, multi-engine',
            'Optional pre-application readiness tools'
          ],
          limitations: []
        }
      ];

      for (const plan of defaultPlans) {
        const { error } = await supabase
          .from('subscription_plans')
          .upsert(plan, { onConflict: 'slug' });

        if (error) {
          console.error(`Error seeding plan ${plan.name}:`, error);
        }
      }

      toast({
        title: 'Success',
        description: 'Default plans seeded successfully'
      });
      fetchPlans();
    } catch (error: any) {
      console.error('Error seeding default plans:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed default plans',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = () => {
    setSelectedPlan(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      monthly_price: '',
      yearly_price: '',
      is_free: false,
      is_active: true,
      sort_order: plans.length > 0 ? Math.max(...plans.map(p => p.sort_order)) + 1 : 1,
      features: '',
      limitations: ''
    });
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      monthly_price: plan.monthly_price_cents ? (plan.monthly_price_cents / 100).toString() : '',
      yearly_price: plan.yearly_price_cents ? (plan.yearly_price_cents / 100).toString() : '',
      is_free: plan.is_free,
      is_active: plan.is_active,
      sort_order: plan.sort_order,
      features: plan.features.join('\n'),
      limitations: (plan.limitations || []).join('\n')
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Plan ${!plan.is_active ? 'activated' : 'deactivated'} successfully`
      });
      fetchPlans();
    } catch (error: any) {
      console.error('Error toggling plan status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update plan status',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    if (!confirm(`Are you sure you want to delete "${plan.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Subscription plan deleted successfully'
      });
      fetchPlans();
    } catch (error: any) {
      console.error('Error deleting subscription plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete subscription plan',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const limitationsArray = formData.limitations
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      const planData: any = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        is_free: formData.is_free,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
        features: featuresArray,
        limitations: limitationsArray
      };

      // Only set price fields if not free
      if (!formData.is_free) {
        planData.monthly_price_cents = formData.monthly_price 
          ? Math.round(parseFloat(formData.monthly_price) * 100) 
          : null;
        planData.yearly_price_cents = formData.yearly_price 
          ? Math.round(parseFloat(formData.yearly_price) * 100) 
          : null;
      } else {
        planData.monthly_price_cents = null;
        planData.yearly_price_cents = null;
      }

      if (isEditing && selectedPlan) {
        const { error } = await supabase
          .from('subscription_plans')
          .update(planData)
          .eq('id', selectedPlan.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Subscription plan updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('subscription_plans')
          .insert(planData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Subscription plan created successfully'
        });
      }

      setIsFormOpen(false);
      fetchPlans();
    } catch (error: any) {
      console.error('Error saving subscription plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save subscription plan',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading or redirect message
  if (!adminLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Redirecting to home page...</p>
        </div>
      </div>
    );
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

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (cents: number | null): string => {
    if (cents === null) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Subscription Management</h1>
              <Badge variant="secondary">Administrator</Badge>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage subscription plans, pricing, and features
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Subscription Plans ({filteredPlans.length})</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                {plans.length === 0 && (
                  <Button 
                    variant="outline" 
                    onClick={handleSeedDefaults}
                    disabled={isSubmitting}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Seed Default Plans
                  </Button>
                )}
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Plan
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'No plans found matching your search' : 'No subscription plans yet'}
                </p>
                {!searchTerm && (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleSeedDefaults} disabled={isSubmitting}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Seed Default Plans
                    </Button>
                    <Button onClick={handleCreate} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Plan
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlans.map((plan) => (
                  <Card key={plan.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{plan.slug}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(plan)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Monthly Price</p>
                          {plan.is_free ? (
                            <Badge variant="outline">Free</Badge>
                          ) : (
                            <p className="text-base font-semibold">{formatPrice(plan.monthly_price_cents)}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Yearly Price</p>
                          {plan.is_free ? (
                            <Badge variant="outline">Free</Badge>
                          ) : (
                            <p className="text-base font-semibold">{formatPrice(plan.yearly_price_cents)}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={plan.is_active}
                            onCheckedChange={() => handleToggleActive(plan)}
                          />
                          {plan.is_active ? (
                            <Badge variant="outline" className="text-green-600">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>Sort Order: {plan.sort_order}</span>
                        <span>{new Date(plan.updated_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plan Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setFormData({ 
                          ...formData, 
                          name: newName,
                          slug: formData.slug || generateSlug(newName)
                        });
                      }}
                      placeholder="e.g., Basic, Pro, Pro Plus"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g., basic, pro, pro-plus"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      URL-friendly identifier (auto-generated from name)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the plan"
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort Order *</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      min="0"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="is_free"
                      checked={formData.is_free}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                    />
                    <Label htmlFor="is_free" className="cursor-pointer">
                      Free Plan
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      Active
                    </Label>
                  </div>
                </div>

                {!formData.is_free && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthly_price">Monthly Price (USD) *</Label>
                      <Input
                        id="monthly_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.monthly_price}
                        onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                        placeholder="e.g., 12.00"
                        required={!formData.is_free}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearly_price">Yearly Price (USD) *</Label>
                      <Input
                        id="yearly_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.yearly_price}
                        onChange={(e) => setFormData({ ...formData, yearly_price: e.target.value })}
                        placeholder="e.g., 129.00"
                        required={!formData.is_free}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="features">Features (one per line) *</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Digital logbook with limited entries&#10;Basic hour tracking&#10;Access to all airline profile pages"
                    rows={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter each feature on a new line
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limitations">Limitations (one per line)</Label>
                  <Textarea
                    id="limitations"
                    value={formData.limitations}
                    onChange={(e) => setFormData({ ...formData, limitations: e.target.value })}
                    placeholder="Limited logbook entries (3 max)&#10;Route Builder locked after 7-day trial&#10;No analytics or breakdowns"
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter each limitation on a new line (optional - typically only for Basic plan)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Update Plan' : 'Create Plan'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
