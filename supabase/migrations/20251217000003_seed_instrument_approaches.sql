-- Seed some common instrument approaches for popular airports
-- This is a starter set - admins can add more through the admin interface

-- JFK (KJFK) approaches
INSERT INTO public.instrument_approaches (airport_code, approach_name, approach_type, runway, minimums_category, active) VALUES
('KJFK', 'ILS 13L', 'ILS', '13L', 'CAT I', true),
('KJFK', 'ILS 13R', 'ILS', '13R', 'CAT I', true),
('KJFK', 'ILS 22L', 'ILS', '22L', 'CAT I', true),
('KJFK', 'ILS 22R', 'ILS', '22R', 'CAT I', true),
('KJFK', 'ILS 31L', 'ILS', '31L', 'CAT I', true),
('KJFK', 'ILS 31R', 'ILS', '31R', 'CAT I', true),
('KJFK', 'ILS 4L', 'ILS', '4L', 'CAT I', true),
('KJFK', 'ILS 4R', 'ILS', '4R', 'CAT I', true),
('KJFK', 'RNAV 13L', 'RNAV', '13L', 'CAT I', true),
('KJFK', 'RNAV 13R', 'RNAV', '13R', 'CAT I', true),
('KJFK', 'RNAV 22L', 'RNAV', '22L', 'CAT I', true),
('KJFK', 'RNAV 22R', 'RNAV', '22R', 'CAT I', true),
('KJFK', 'VOR 13L', 'VOR', '13L', NULL, true),
('KJFK', 'VOR 22L', 'VOR', '22L', NULL, true),
('KJFK', 'LOC 13L', 'LOC', '13L', NULL, true),
('KJFK', 'LOC 22L', 'LOC', '22L', NULL, true)
ON CONFLICT (airport_code, approach_name) DO NOTHING;

-- LGA (KLGA) approaches
INSERT INTO public.instrument_approaches (airport_code, approach_name, approach_type, runway, minimums_category, active) VALUES
('KLGA', 'ILS 4', 'ILS', '4', 'CAT I', true),
('KLGA', 'ILS 13', 'ILS', '13', 'CAT I', true),
('KLGA', 'ILS 22', 'ILS', '22', 'CAT I', true),
('KLGA', 'ILS 31', 'ILS', '31', 'CAT I', true),
('KLGA', 'RNAV 4', 'RNAV', '4', 'CAT I', true),
('KLGA', 'RNAV 13', 'RNAV', '13', 'CAT I', true),
('KLGA', 'RNAV 22', 'RNAV', '22', 'CAT I', true),
('KLGA', 'RNAV 31', 'RNAV', '31', 'CAT I', true),
('KLGA', 'VOR 4', 'VOR', '4', NULL, true),
('KLGA', 'VOR 13', 'VOR', '13', NULL, true),
('KLGA', 'LOC 4', 'LOC', '4', NULL, true),
('KLGA', 'LOC 13', 'LOC', '13', NULL, true)
ON CONFLICT (airport_code, approach_name) DO NOTHING;

-- LAX (KLAX) approaches
INSERT INTO public.instrument_approaches (airport_code, approach_name, approach_type, runway, minimums_category, active) VALUES
('KLAX', 'ILS 6L', 'ILS', '6L', 'CAT I', true),
('KLAX', 'ILS 6R', 'ILS', '6R', 'CAT I', true),
('KLAX', 'ILS 7L', 'ILS', '7L', 'CAT I', true),
('KLAX', 'ILS 7R', 'ILS', '7R', 'CAT I', true),
('KLAX', 'ILS 24L', 'ILS', '24L', 'CAT I', true),
('KLAX', 'ILS 24R', 'ILS', '24R', 'CAT I', true),
('KLAX', 'ILS 25L', 'ILS', '25L', 'CAT I', true),
('KLAX', 'ILS 25R', 'ILS', '25R', 'CAT I', true),
('KLAX', 'RNAV 6L', 'RNAV', '6L', 'CAT I', true),
('KLAX', 'RNAV 6R', 'RNAV', '6R', 'CAT I', true),
('KLAX', 'RNAV 24L', 'RNAV', '24L', 'CAT I', true),
('KLAX', 'RNAV 24R', 'RNAV', '24R', 'CAT I', true),
('KLAX', 'VOR 6L', 'VOR', '6L', NULL, true),
('KLAX', 'VOR 24L', 'VOR', '24L', NULL, true)
ON CONFLICT (airport_code, approach_name) DO NOTHING;

-- ORD (KORD) approaches
INSERT INTO public.instrument_approaches (airport_code, approach_name, approach_type, runway, minimums_category, active) VALUES
('KORD', 'ILS 9L', 'ILS', '9L', 'CAT I', true),
('KORD', 'ILS 9R', 'ILS', '9R', 'CAT I', true),
('KORD', 'ILS 10L', 'ILS', '10L', 'CAT I', true),
('KORD', 'ILS 10R', 'ILS', '10R', 'CAT I', true),
('KORD', 'ILS 27L', 'ILS', '27L', 'CAT I', true),
('KORD', 'ILS 27R', 'ILS', '27R', 'CAT I', true),
('KORD', 'ILS 28L', 'ILS', '28L', 'CAT I', true),
('KORD', 'ILS 28R', 'ILS', '28R', 'CAT I', true),
('KORD', 'RNAV 9L', 'RNAV', '9L', 'CAT I', true),
('KORD', 'RNAV 9R', 'RNAV', '9R', 'CAT I', true),
('KORD', 'RNAV 27L', 'RNAV', '27L', 'CAT I', true),
('KORD', 'RNAV 27R', 'RNAV', '27R', 'CAT I', true),
('KORD', 'VOR 9L', 'VOR', '9L', NULL, true),
('KORD', 'VOR 27L', 'VOR', '27L', NULL, true)
ON CONFLICT (airport_code, approach_name) DO NOTHING;

-- DFW (KDFW) approaches
INSERT INTO public.instrument_approaches (airport_code, approach_name, approach_type, runway, minimums_category, active) VALUES
('KDFW', 'ILS 13L', 'ILS', '13L', 'CAT I', true),
('KDFW', 'ILS 13R', 'ILS', '13R', 'CAT I', true),
('KDFW', 'ILS 17L', 'ILS', '17L', 'CAT I', true),
('KDFW', 'ILS 17R', 'ILS', '17R', 'CAT I', true),
('KDFW', 'ILS 18L', 'ILS', '18L', 'CAT I', true),
('KDFW', 'ILS 18R', 'ILS', '18R', 'CAT I', true),
('KDFW', 'ILS 31L', 'ILS', '31L', 'CAT I', true),
('KDFW', 'ILS 31R', 'ILS', '31R', 'CAT I', true),
('KDFW', 'ILS 35L', 'ILS', '35L', 'CAT I', true),
('KDFW', 'ILS 35R', 'ILS', '35R', 'CAT I', true),
('KDFW', 'ILS 36L', 'ILS', '36L', 'CAT I', true),
('KDFW', 'ILS 36R', 'ILS', '36R', 'CAT I', true),
('KDFW', 'RNAV 13L', 'RNAV', '13L', 'CAT I', true),
('KDFW', 'RNAV 17L', 'RNAV', '17L', 'CAT I', true),
('KDFW', 'RNAV 18L', 'RNAV', '18L', 'CAT I', true),
('KDFW', 'VOR 13L', 'VOR', '13L', NULL, true)
ON CONFLICT (airport_code, approach_name) DO NOTHING;

