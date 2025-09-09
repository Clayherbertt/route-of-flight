-- Add missing cargo airlines and update existing ones with comprehensive 2025 data

-- Insert UPS Airlines (doesn't exist yet)
INSERT INTO airlines (
  name, logo, call_sign, pilot_group_size, description, pilot_union, category,
  fleet_size, fleet_info, is_hiring, retirements_in_2025,
  bases, fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  required_qualifications, preferred_qualifications, inside_scoop, additional_info,
  most_junior_base, most_junior_captain_hire_date
) VALUES (
  'UPS Airlines', '🚚', 'UPS', '3,100+',
  'The world''s second-largest cargo airline and a major division of United Parcel Service. UPS Airlines operates an extensive domestic and international network serving over 220 countries and territories.',
  'IPA (Independent Pilots Association)', 'Cargo',
  280, '[
    {"aircraft": "Boeing 747-8F", "count": 28, "notes": "Long-haul flagship"},
    {"aircraft": "Boeing 767-300F", "count": 75, "notes": "Medium-haul workhorse"},
    {"aircraft": "Airbus A300-600F", "count": 52, "notes": "Medium-haul cargo"},
    {"aircraft": "Boeing MD-11F", "count": 37, "notes": "Long-haul cargo"},
    {"aircraft": "Boeing 757-200F", "count": 75, "notes": "Domestic and short-haul"},
    {"aircraft": "ATR 72F", "count": 13, "notes": "Feeder operations"}
  ]'::jsonb,
  true, 45,
  ARRAY['Louisville (SDF) - Primary Hub', 'Philadelphia (PHL)', 'Rockford (RFD)', 'Ontario (ONT)', 'Columbia (CAE)', 'Hartford (BDL)', 'Cologne (CGN)', 'Shanghai (PVG)', 'Shenzhen (SZX)'],
  '$85/hour', '$140/hour', '$185/hour',
  '$160/hour', '$215/hour', '$280/hour',
  ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean Background Check'],
  ARRAY['College Degree', '2,000+ Total Time', 'Turbine Experience', 'Cargo Experience', 'International Experience'],
  ARRAY['Strong union representation with IPA', 'Competitive pay and benefits', 'Job security in cargo sector', 'Global network operations', 'Excellent retirement benefits'],
  ARRAY['Second highest paying cargo carrier', 'Strong pilot union (IPA)', 'Extensive international routes', 'Brown pride and company culture', 'Louisville hub in central US'],
  'Columbia (CAE)', 'March 2020'
);

-- Insert Southern Air (doesn't exist yet)
INSERT INTO airlines (
  name, logo, call_sign, pilot_group_size, description, pilot_union, category,
  fleet_size, fleet_info, is_hiring, retirements_in_2025,
  bases, fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  required_qualifications, preferred_qualifications, inside_scoop, additional_info,
  most_junior_base, most_junior_captain_hire_date
) VALUES (
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
);

-- Insert Polar Air Cargo (doesn't exist yet)
INSERT INTO airlines (
  name, logo, call_sign, pilot_group_size, description, pilot_union, category,
  fleet_size, fleet_info, is_hiring, retirements_in_2025,
  bases, fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  required_qualifications, preferred_qualifications, inside_scoop, additional_info,
  most_junior_base, most_junior_captain_hire_date
) VALUES (
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
);

-- Update existing cargo airlines with comprehensive 2025 data

-- Update FedEx Express
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

-- Update Atlas Air
UPDATE airlines SET
  pilot_group_size = '2,200+',
  description = 'A leading provider of outsourced aircraft and aviation operating services. Atlas Air operates cargo and passenger aircraft for airlines, freight forwarders, and the military under the Air Mobility Command.',
  pilot_union = 'Teamsters Local 1224',
  fleet_size = 100,
  fleet_info = '[
    {"aircraft": "Boeing 747-400F", "count": 32, "notes": "Long-haul cargo"},
    {"aircraft": "Boeing 747-8F", "count": 18, "notes": "Latest freighter"},
    {"aircraft": "Boeing 767-300F", "count": 28, "notes": "Medium-haul cargo"},
    {"aircraft": "Boeing 777F", "count": 12, "notes": "Long-haul premium"},
    {"aircraft": "Boeing 747-400", "count": 10, "notes": "Passenger charter"}
  ]'::jsonb,
  is_hiring = true,
  retirements_in_2025 = 15,
  bases = ARRAY['Purchase (PUR/JFK)', 'Miami (MIA)', 'Cincinnati (CVG)', 'Anchorage (ANC)', 'Toledo (TOL)'],
  fo_pay_year_1 = '$78/hour',
  fo_pay_year_5 = '$125/hour',
  fo_pay_year_10 = '$165/hour',
  captain_pay_year_1 = '$145/hour',
  captain_pay_year_5 = '$190/hour',
  captain_pay_year_10 = '$245/hour',
  required_qualifications = ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '500 Multi-Engine Time', 'Clean Background and MVR'],
  preferred_qualifications = ARRAY['College Degree Preferred', '2,500+ Total Time', '1,000+ Turbine Time', 'International Experience', 'Heavy Aircraft Experience'],
  inside_scoop = ARRAY['Diverse flying: cargo, passenger, military', 'International heavy aircraft experience', 'Contract flying for major carriers', 'Growing military business', 'Competitive benefits package'],
  additional_info = ARRAY['Flies for Amazon Prime Air', 'Military contract work (AMC)', 'Wet lease operations for airlines', 'New York area based', 'Rapid growth opportunities'],
  most_junior_base = 'Purchase (PUR)',
  most_junior_captain_hire_date = 'June 2018',
  call_sign = 'Giant'
WHERE name = 'Atlas Air';

-- Update Kalitta Air
UPDATE airlines SET
  pilot_group_size = '550+',
  description = 'A cargo airline providing freight transportation services worldwide. Known for operating a diverse fleet of freighter aircraft and providing charter services for oversized cargo and special missions.',
  pilot_union = 'Teamsters Local 357',
  fleet_size = 35,
  fleet_info = '[
    {"aircraft": "Boeing 747-400F", "count": 20, "notes": "Long-haul freighter"},
    {"aircraft": "Boeing 767-300F", "count": 8, "notes": "Medium-haul cargo"},
    {"aircraft": "Boeing 737-400F", "count": 7, "notes": "Short-haul cargo"}
  ]'::jsonb,
  is_hiring = true,
  retirements_in_2025 = 8,
  bases = ARRAY['Oscoda-Wurtsmith (OSC)', 'Ypsilanti (YIP)'],
  fo_pay_year_1 = '$72/hour',
  fo_pay_year_5 = '$110/hour',
  fo_pay_year_10 = '$145/hour',
  captain_pay_year_1 = '$125/hour',
  captain_pay_year_5 = '$165/hour',
  captain_pay_year_10 = '$210/hour',
  required_qualifications = ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean Background Check'],
  preferred_qualifications = ARRAY['College Degree Preferred', '2,000+ Total Time', 'Turbine Experience', 'International Experience', 'Cargo Experience'],
  inside_scoop = ARRAY['Family-owned company culture', 'Diverse charter operations', 'International flying opportunities', 'Smaller company, more personal', 'Specialized cargo missions'],
  additional_info = ARRAY['Michigan-based operation', 'Charter and scheduled cargo', 'Oversized cargo specialist', 'Close-knit pilot group', 'Unique flying opportunities'],
  most_junior_base = 'Oscoda-Wurtsmith (OSC)',
  most_junior_captain_hire_date = 'September 2021',
  call_sign = 'Connie'
WHERE name = 'Kalitta Air';