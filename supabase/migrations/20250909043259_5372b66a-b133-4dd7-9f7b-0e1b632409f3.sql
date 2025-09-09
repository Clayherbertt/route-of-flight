-- Check for missing cargo airlines and add only those that don't exist

-- Insert Southern Air (if doesn't exist)
INSERT INTO airlines (
  name, logo, call_sign, pilot_group_size, description, pilot_union, category,
  fleet_size, fleet_info, is_hiring, retirements_in_2025,
  bases, fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  required_qualifications, preferred_qualifications, inside_scoop, additional_info,
  most_junior_base, most_junior_captain_hire_date
)
SELECT 
  'Southern Air', '🇺🇸', 'Southern Air', '450+',
  'A cargo airline specializing in express freight, charter, and military contract services. Part of the Atlas Air Worldwide Holdings family, operating primarily Boeing 777 freighters.',
  'Teamsters Local 1224', 'Cargo',
  18, '[
    {"aircraft": "Boeing 777F", "count": 14, "notes": "Primary fleet type"},
    {"aircraft": "Boeing 747-400F", "count": 4, "notes": "Heavy cargo operations"}
  ]'::jsonb,
  false, 2,
  ARRAY['Miami (MIA)', 'Anchorage (ANC)', 'Cincinnati (CVG)'],
  '$75/hour', '$120/hour', '$155/hour',
  '$140/hour', '$185/hour', '$235/hour',
  ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '500 Multi-Engine Time', 'Clean Background Check'],
  ARRAY['College Degree', '2,500+ Total Time', 'International Experience', 'Heavy Aircraft Experience', 'Military Background'],
  ARRAY['Atlas Air family benefits', 'Modern Boeing 777F fleet', 'International operations', 'Military contract work', 'Miami base advantages'],
  ARRAY['Part of Atlas Air group', 'Focus on 777F operations', 'DHL and military contracts', 'Limited hiring currently', 'Merger considerations ongoing'],
  'Miami (MIA)', 'April 2020'
WHERE NOT EXISTS (SELECT 1 FROM airlines WHERE name = 'Southern Air');

-- Insert Polar Air Cargo (if doesn't exist)
INSERT INTO airlines (
  name, logo, call_sign, pilot_group_size, description, pilot_union, category,
  fleet_size, fleet_info, is_hiring, retirements_in_2025,
  bases, fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  required_qualifications, preferred_qualifications, inside_scoop, additional_info,
  most_junior_base, most_junior_captain_hire_date
)
SELECT 
  'Polar Air Cargo', '🐻', 'Polar', '280+',
  'An American cargo airline providing scheduled and charter freight services. Operates primarily Boeing 747 freighters with a focus on trans-Pacific routes and international cargo operations.',
  'Teamsters Local 1224', 'Cargo',
  12, '[
    {"aircraft": "Boeing 747-400F", "count": 8, "notes": "Long-haul freighter"},
    {"aircraft": "Boeing 747-8F", "count": 4, "notes": "Latest generation"}
  ]'::jsonb,
  false, 3,
  ARRAY['Purchase (PUR/JFK)', 'Anchorage (ANC)'],
  '$74/hour', '$115/hour', '$150/hour',
  '$135/hour', '$175/hour', '$225/hour',
  ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '500 Multi-Engine Time', 'International Experience Required'],
  ARRAY['College Degree', '3,000+ Total Time', 'Heavy Aircraft Experience', 'Pacific Routes Experience', 'Asian Operations Knowledge'],
  ARRAY['Atlas Air family carrier', 'International 747 operations', 'Trans-Pacific specialists', 'New York area based', 'Experienced pilot group'],
  ARRAY['Part of Atlas Air group', 'Focus on Asia-Pacific routes', 'All 747 operations', 'Limited hiring', 'Niche market position'],
  'Purchase (PUR)', 'February 2018'
WHERE NOT EXISTS (SELECT 1 FROM airlines WHERE name = 'Polar Air Cargo');

-- Update FedEx Express with comprehensive data
UPDATE airlines SET
  pilot_group_size = '5,400+',
  description = 'The world''s largest express transportation company and cargo airline, operating one of the largest fleets of all-cargo aircraft. FedEx Express provides time-definite delivery to more than 220 countries and territories.',
  pilot_union = 'ALPA (Air Line Pilots Association)',
  fleet_size = 650,
  fleet_info = '[
    {"aircraft": "Boeing 777F", "count": 50, "notes": "Long-haul freighter"},
    {"aircraft": "Boeing 767F", "count": 120, "notes": "Medium-haul cargo"},
    {"aircraft": "Airbus A300-600F", "count": 70, "notes": "Being retired"},
    {"aircraft": "Boeing MD-10", "count": 55, "notes": "Being retired"},
    {"aircraft": "Boeing MD-11F", "count": 57, "notes": "Long-haul cargo"},
    {"aircraft": "ATR 42/72F", "count": 50, "notes": "Feeder operations"},
    {"aircraft": "Cessna 208", "count": 248, "notes": "Small package delivery"}
  ]'::jsonb,
  is_hiring = true,
  retirements_in_2025 = 85,
  bases = ARRAY['Memphis (MEM) - Primary Hub', 'Indianapolis (IND)', 'Newark (EWR)', 'Oakland (OAK)', 'Miami (MIA)', 'Anchorage (ANC)', 'Cologne (CGN)', 'Guangzhou (CAN)', 'Paris (CDG)'],
  fo_pay_year_1 = '$89/hour',
  fo_pay_year_5 = '$145/hour',
  fo_pay_year_10 = '$195/hour',
  captain_pay_year_1 = '$165/hour',
  captain_pay_year_5 = '$220/hour',
  captain_pay_year_10 = '$290/hour',
  required_qualifications = ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean MVR and Background'],
  preferred_qualifications = ARRAY['College Degree Preferred', '2,500+ Total Time', '1,000+ Turbine Time', 'International Experience', 'Previous Cargo Experience'],
  inside_scoop = ARRAY['Excellent benefits and profit sharing', 'Strong job security in cargo market', 'Rapid advancement opportunities', 'Global flying to 220+ countries', 'Industry-leading retirement benefits'],
  additional_info = ARRAY['One of the highest paying cargo carriers', 'Strong culture of safety and professionalism', 'Significant international flying opportunities', 'Cargo operations less affected by economic downturns', 'Memphis hub offers lower cost of living'],
  most_junior_base = 'Indianapolis (IND)',
  most_junior_captain_hire_date = 'January 2019',
  call_sign = 'FedEx'
WHERE name = 'FedEx Express';

-- Update UPS Airlines (assuming it exists as "United Parcel Service")
UPDATE airlines SET
  name = 'UPS Airlines',
  logo = '🚚',
  call_sign = 'UPS',
  pilot_group_size = '3,100+',
  description = 'The world''s second-largest cargo airline and a major division of United Parcel Service. UPS Airlines operates an extensive domestic and international network serving over 220 countries and territories.',
  pilot_union = 'IPA (Independent Pilots Association)',
  fleet_size = 280,
  fleet_info = '[
    {"aircraft": "Boeing 747-8F", "count": 28, "notes": "Long-haul flagship"},
    {"aircraft": "Boeing 767-300F", "count": 75, "notes": "Medium-haul workhorse"},
    {"aircraft": "Airbus A300-600F", "count": 52, "notes": "Medium-haul cargo"},
    {"aircraft": "Boeing MD-11F", "count": 37, "notes": "Long-haul cargo"},
    {"aircraft": "Boeing 757-200F", "count": 75, "notes": "Domestic and short-haul"},
    {"aircraft": "ATR 72F", "count": 13, "notes": "Feeder operations"}
  ]'::jsonb,
  is_hiring = true,
  retirements_in_2025 = 45,
  bases = ARRAY['Louisville (SDF) - Primary Hub', 'Philadelphia (PHL)', 'Rockford (RFD)', 'Ontario (ONT)', 'Columbia (CAE)', 'Hartford (BDL)', 'Cologne (CGN)', 'Shanghai (PVG)', 'Shenzhen (SZX)'],
  fo_pay_year_1 = '$85/hour',
  fo_pay_year_5 = '$140/hour',
  fo_pay_year_10 = '$185/hour',
  captain_pay_year_1 = '$160/hour',
  captain_pay_year_5 = '$215/hour',
  captain_pay_year_10 = '$280/hour',
  required_qualifications = ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean Background Check'],
  preferred_qualifications = ARRAY['College Degree', '2,000+ Total Time', 'Turbine Experience', 'Cargo Experience', 'International Experience'],
  inside_scoop = ARRAY['Strong union representation with IPA', 'Competitive pay and benefits', 'Job security in cargo sector', 'Global network operations', 'Excellent retirement benefits'],
  additional_info = ARRAY['Second highest paying cargo carrier', 'Strong pilot union (IPA)', 'Extensive international routes', 'Brown pride and company culture', 'Louisville hub in central US'],
  most_junior_base = 'Columbia (CAE)',
  most_junior_captain_hire_date = 'March 2020'
WHERE name = 'United Parcel Service';