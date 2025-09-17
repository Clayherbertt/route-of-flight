-- Add additional pay year columns for First Officer and Captain positions
-- This will give us 10 years of pay data for each role

-- First Officer pay years 2-4 and 6-9 (we already have 1, 5, 10)
ALTER TABLE public.airlines 
ADD COLUMN fo_pay_year_2 text,
ADD COLUMN fo_pay_year_3 text,
ADD COLUMN fo_pay_year_4 text,
ADD COLUMN fo_pay_year_6 text,
ADD COLUMN fo_pay_year_7 text,
ADD COLUMN fo_pay_year_8 text,
ADD COLUMN fo_pay_year_9 text;

-- Captain pay years 2-4 and 6-9 (we already have 1, 5, 10)
ALTER TABLE public.airlines 
ADD COLUMN captain_pay_year_2 text,
ADD COLUMN captain_pay_year_3 text,
ADD COLUMN captain_pay_year_4 text,
ADD COLUMN captain_pay_year_6 text,
ADD COLUMN captain_pay_year_7 text,
ADD COLUMN captain_pay_year_8 text,
ADD COLUMN captain_pay_year_9 text;