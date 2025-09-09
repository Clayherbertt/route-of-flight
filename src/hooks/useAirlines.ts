import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DatabaseAirline = Database['public']['Tables']['airlines']['Row'];

export interface AirlineData {
  id: string;
  name: string;
  logo: string;
  call_sign: string;
  pilot_group_size: string;
  fleet_size: number;
  description: string;
  pilot_union: string;
  fleet_info: { type: string; quantity: number }[];
  bases: string[];
  is_hiring: boolean;
  application_url?: string;
  required_qualifications: string[];
  preferred_qualifications: string[];
  inside_scoop: string[];
  most_junior_base?: string;
  most_junior_captain_hire_date?: string;
  retirements_in_2025: number;
  fo_pay_year_1?: string;
  fo_pay_year_5?: string;
  fo_pay_year_10?: string;
  captain_pay_year_1?: string;
  captain_pay_year_5?: string;
  captain_pay_year_10?: string;
  additional_info: string[];
  category: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to transform database row to AirlineData
const transformDatabaseAirline = (dbAirline: DatabaseAirline): AirlineData => ({
  id: dbAirline.id,
  name: dbAirline.name,
  logo: dbAirline.logo || '✈️',
  call_sign: dbAirline.call_sign,
  pilot_group_size: dbAirline.pilot_group_size,
  fleet_size: dbAirline.fleet_size,
  description: dbAirline.description,
  pilot_union: dbAirline.pilot_union,
  fleet_info: Array.isArray(dbAirline.fleet_info) ? dbAirline.fleet_info as { type: string; quantity: number }[] : [],
  bases: dbAirline.bases || [],
  is_hiring: dbAirline.is_hiring || false,
  application_url: dbAirline.application_url || undefined,
  required_qualifications: dbAirline.required_qualifications || [],
  preferred_qualifications: dbAirline.preferred_qualifications || [],
  inside_scoop: dbAirline.inside_scoop || [],
  most_junior_base: dbAirline.most_junior_base || undefined,
  most_junior_captain_hire_date: dbAirline.most_junior_captain_hire_date || undefined,
  retirements_in_2025: dbAirline.retirements_in_2025 || 0,
  fo_pay_year_1: dbAirline.fo_pay_year_1 || undefined,
  fo_pay_year_5: dbAirline.fo_pay_year_5 || undefined,
  fo_pay_year_10: dbAirline.fo_pay_year_10 || undefined,
  captain_pay_year_1: dbAirline.captain_pay_year_1 || undefined,
  captain_pay_year_5: dbAirline.captain_pay_year_5 || undefined,
  captain_pay_year_10: dbAirline.captain_pay_year_10 || undefined,
  additional_info: dbAirline.additional_info || [],
  category: dbAirline.category || 'Majors',
  active: dbAirline.active,
  created_at: dbAirline.created_at,
  updated_at: dbAirline.updated_at,
});

export function useAirlines() {
  const [airlines, setAirlines] = useState<AirlineData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAirlines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('airlines')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setAirlines((data || []).map(transformDatabaseAirline));
    } catch (error) {
      console.error('Error fetching airlines:', error);
      toast({
        title: "Error",
        description: "Failed to fetch airlines",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAirline = async (airlineData: Omit<AirlineData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('airlines')
        .insert([airlineData])
        .select()
        .single();

      if (error) throw error;

      const transformedData = transformDatabaseAirline(data);
      setAirlines(prev => [...prev, transformedData]);
      toast({
        title: "Success",
        description: "Airline created successfully",
      });
      return transformedData;
    } catch (error) {
      console.error('Error creating airline:', error);
      toast({
        title: "Error",
        description: "Failed to create airline",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAirline = async (id: string, updates: Partial<AirlineData>) => {
    try {
      const { data, error } = await supabase
        .from('airlines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const transformedData = transformDatabaseAirline(data);
      setAirlines(prev => prev.map(airline => 
        airline.id === id ? transformedData : airline
      ));
      
      toast({
        title: "Success",
        description: "Airline updated successfully",
      });
      return transformedData;
    } catch (error) {
      console.error('Error updating airline:', error);
      toast({
        title: "Error",
        description: "Failed to update airline",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAirline = async (id: string) => {
    try {
      const { error } = await supabase
        .from('airlines')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;

      setAirlines(prev => prev.filter(airline => airline.id !== id));
      toast({
        title: "Success",
        description: "Airline deactivated successfully",
      });
    } catch (error) {
      console.error('Error deactivating airline:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate airline",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAirlineByName = (name: string): AirlineData | undefined => {
    return airlines.find(airline => airline.name === name);
  };

  useEffect(() => {
    fetchAirlines();
  }, []);

  // Add window focus listener to refetch data when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      fetchAirlines();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return {
    airlines,
    loading,
    createAirline,
    updateAirline,
    deleteAirline,
    getAirlineByName,
    refetch: fetchAirlines,
  };
}