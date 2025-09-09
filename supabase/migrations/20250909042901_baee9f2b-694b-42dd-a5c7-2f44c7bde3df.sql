-- Insert comprehensive cargo airline data for 2025

-- FedEx Express
INSERT INTO airlines (
  name, logo, call_sign, pilot_group_size, description, pilot_union, category,
  fleet_size, fleet_info, is_hiring, retirements_in_2025,
  bases, fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  required_qualifications, preferred_qualifications, inside_scoop, additional_info,
  most_junior_base, most_junior_captain_hire_date
) VALUES (
  'FedEx Express', '📦', 'FedEx', '5,400+', 
  'The world''s largest express transportation company and cargo airline, operating one of the largest fleets of all-cargo aircraft. FedEx Express provides time-definite delivery to more than 220 countries and territories.',
  'ALPA (Air Line Pilots Association)', 'Cargo',
  650, '[
    {"aircraft": "Boeing 777F", "count": 50, "notes": "Long-haul freighter"},
    {"aircraft": "Boeing 767F", "count": 120, "notes": "Medium-haul cargo"},
    {"aircraft": "Airbus A300-600F", "count": 70, "notes": "Being retired"},
    {"aircraft": "Boeing MD-10", "count": 55, "notes": "Being retired"},
    {"aircraft": "Boeing MD-11F", "count": 57, "notes": "Long-haul cargo"},
    {"aircraft": "ATR 42/72F", "count": 50, "notes": "Feeder operations"},
    {"aircraft": "Cessna 208", "count": 248, "notes": "Small package delivery"}
  ]'::jsonb,
  true, 85,
  ARRAY['Memphis (MEM) - Primary Hub', 'Indianapolis (IND)', 'Newark (EWR)', 'Oakland (OAK)', 'Miami (MIA)', 'Anchorage (ANC)', 'Cologne (CGN)', 'Guangzhou (CAN)', 'Paris (CDG)'],
  '$89/hour', '$145/hour', '$195/hour',
  '$165/hour', '$220/hour', '$290/hour',
  ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean MVR and Background'],
  ARRAY['College Degree Preferred', '2,500+ Total Time', '1,000+ Turbine Time', 'International Experience', 'Previous Cargo Experience'],
  ARRAY['Excellent benefits and profit sharing', 'Strong job security in cargo market', 'Rapid advancement opportunities', 'Global flying to 220+ countries', 'Industry-leading retirement benefits'],
  ARRAY['One of the highest paying cargo carriers', 'Strong culture of safety and professionalism', 'Significant international flying opportunities', 'Cargo operations less affected by economic downturns', 'Memphis hub offers lower cost of living'],
  'Indianapolis (IND)', 'January 2019'
);

-- UPS Airlines
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

-- Atlas Air
INSERT INTO airlines (
  name, logo, call_sign, pilot_group_size, description, pilot_union, category,
  fleet_size, fleet_info, is_hiring, retirements_in_2025,
  bases, fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  required_qualifications, preferred_qualifications, inside_scoop, additional_info,
  most_junior_base, most_junior_captain_hire_date
) VALUES (
  'Atlas Air', '🌐', 'Giant', '2,200+',
  'A leading provider of outsourced aircraft and aviation operating services. Atlas Air operates cargo and passenger aircraft for airlines, freight forwarders, and the military under the Air Mobility Command.',
  'Teamsters Local 1224', 'Cargo',
  100, '[
    {"aircraft": "Boeing 747-400F", "count": 32, "notes": "Long-haul cargo"},
    {"aircraft": "Boeing 747-8F", "count": 18, "notes": "Latest freighter"},
    {"aircraft": "Boeing 767-300F", "count": 28, "notes": "Medium-haul cargo"},
    {"aircraft": "Boeing 777F", "count": 12, "notes": "Long-haul premium"},
    {"aircraft": "Boeing 747-400", "count": 10, "notes": "Passenger charter"}
  ]'::jsonb,
  true, 15,
  ARRAY['Purchase (PUR/JFK)', 'Miami (MIA)', 'Cincinnati (CVG)', 'Anchorage (ANC)', 'Toledo (TOL)'],
  '$78/hour', '$125/hour', '$165/hour',
  '$145/hour', '$190/hour', '$245/hour',
  ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '500 Multi-Engine Time', 'Clean Background and MVR'],
  ARRAY['College Degree Preferred', '2,500+ Total Time', '1,000+ Turbine Time', 'International Experience', 'Heavy Aircraft Experience'],
  ARRAY['Diverse flying: cargo, passenger, military', 'International heavy aircraft experience', 'Contract flying for major carriers', 'Growing military business', 'Competitive benefits package'],
  ARRAY['Flies for Amazon Prime Air', 'Military contract work (AMC)', 'Wet lease operations for airlines', 'New York area based', 'Rapid growth opportunities'],
  'Purchase (PUR)', 'June 2018'
);

-- Kalitta Air
INSERT INTO airlines (
  name, logo, call_sign, pilot_group_size, description, pilot_union, category,
  fleet_size, fleet_info, is_hiring, retirements_in_2025,
  bases, fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  required_qualifications, preferred_qualifications, inside_scoop, additional_info,
  most_junior_base, most_junior_captain_hire_date
) VALUES (
  'Kalitta Air', '✈️', 'Connie', '550+',
  'A cargo airline providing freight transportation services worldwide. Known for operating a diverse fleet of freighter aircraft and providing charter services for oversized cargo and special missions.',
  'Teamsters Local 357', 'Cargo',
  35, '[
    {"aircraft": "Boeing 747-400F", "count": 20, "notes": "Long-haul freighter"},
    {"aircraft": "Boeing 767-300F", "count": 8, "notes": "Medium-haul cargo"},
    {"aircraft": "Boeing 737-400F", "count": 7, "notes": "Short-haul cargo"}
  ]'::jsonb,
  true, 8,
  ARRAY['Oscoda-Wurtsmith (OSC)', 'Ypsilanti (YIP)'],
  '$72/hour', '$110/hour', '$145/hour',
  '$125/hour', '$165/hour', '$210/hour',
  ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean Background Check'],
  ARRAY['College Degree Preferred', '2,000+ Total Time', 'Turbine Experience', 'International Experience', 'Cargo Experience'],
  ARRAY['Family-owned company culture', 'Diverse charter operations', 'International flying opportunities', 'Smaller company, more personal', 'Specialized cargo missions'],
  ARRAY['Michigan-based operation', 'Charter and scheduled cargo', 'Oversized cargo specialist', 'Close-knit pilot group', 'Unique flying opportunities'],
  'Oscoda-Wurtsmith (OSC)', 'September 2021'
);

-- Southern Air
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

-- ABX Air
INSERT INTO airlines (
  name, logo, call_sign, pilot_group_size, description, pilot_union, category,
  fleet_size, fleet_info, is_hiring, retirements_in_2025,
  bases, fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  required_qualifications, preferred_qualifications, inside_scoop, additional_info,
  most_junior_base, most_junior_captain_hire_date
) VALUES (
  'ABX Air', '📮', 'Abex', '350+',
  'An American cargo airline operating primarily under contract to DHL Express. ABX Air provides domestic air cargo transportation services with a focus on overnight and express delivery.',
  'Teamsters Local 1224', 'Cargo',
  25, '[
    {"aircraft": "Boeing 767-200F", "count": 15, "notes": "DHL contract flying"},
    {"aircraft": "Boeing 767-300F", "count": 10, "notes": "DHL contract flying"}
  ]'::jsonb,
  false, 5,
  ARRAY['Wilmington (ILN)', 'Toledo (TOL)'],
  '$70/hour', '$105/hour', '$135/hour',
  '$120/hour', '$155/hour', '$195/hour',
  ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean Background Check'],
  ARRAY['College Degree Preferred', '2,000+ Total Time', 'Cargo Experience', 'DHL System Knowledge', 'Teamster Experience'],
  ARRAY['Long-term DHL contract', 'Domestic cargo operations', 'Steady schedules', 'Ohio-based operation', 'Established carrier'],
  ARRAY['Primary DHL contractor', 'Mostly domestic flying', 'Stable but limited growth', 'Older fleet considerations', 'Contract dependency'],
  'Wilmington (ILN)', 'November 2019'
);

-- Western Global Airlines
INSERT INTO airlines (
  name, logo, call_sign, pilot_group_size, description, pilot_union, category,
  fleet_size, fleet_info, is_hiring, retirements_in_2025,
  bases, fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  required_qualifications, preferred_qualifications, inside_scoop, additional_info,
  most_junior_base, most_junior_captain_hire_date
) VALUES (
  'Western Global Airlines', '🌎', 'Western Global', '180+',
  'A cargo airline providing domestic and international freight services. Operates a fleet of MD-11 freighters serving routes across the Americas, with growing operations in South America.',
  'Non-Union', 'Cargo',
  8, '[
    {"aircraft": "Boeing MD-11F", "count": 6, "notes": "Primary fleet type"},
    {"aircraft": "Boeing 747-400F", "count": 2, "notes": "Heavy cargo ops"}
  ]'::jsonb,
  true, 1,
  ARRAY['Miami (MIA)', 'Aguadilla (BQN)'],
  '$68/hour', '$95/hour', '$125/hour',
  '$115/hour', '$145/hour', '$185/hour',
  ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean Background Check'],
  ARRAY['College Degree Preferred', '2,000+ Total Time', 'International Experience', 'Spanish Language Skills', 'Latin America Experience'],
  ARRAY['Growing carrier with opportunities', 'International operations focus', 'Latin American routes', 'Smaller company culture', 'Direct access to management'],
  ARRAY['Non-union environment', 'Focus on Americas routes', 'Growing South American operations', 'Miami-based operations', 'Entrepreneurial culture'],
  'Miami (MIA)', 'August 2022'
);

-- Amerijet International
INSERT INTO airlines (
  name, logo, call_sign, pilot_group_size, description, pilot_union, category,
  fleet_size, fleet_info, is_hiring, retirements_in_2025,
  bases, fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  required_qualifications, preferred_qualifications, inside_scoop, additional_info,
  most_junior_base, most_junior_captain_hire_date
) VALUES (
  'Amerijet International', '🚛', 'Amerijet', '120+',
  'A cargo airline specializing in express freight services throughout the Americas. Known for operations to the Caribbean, Central America, and South America with both scheduled and charter services.',
  'Non-Union', 'Cargo',
  12, '[
    {"aircraft": "Boeing 767-300F", "count": 8, "notes": "Primary cargo aircraft"},
    {"aircraft": "Boeing 737-400F", "count": 4, "notes": "Short-haul cargo"}
  ]'::jsonb,
  true, 2,
  ARRAY['Miami (MIA)', 'Fort Lauderdale (FLL)'],
  '$65/hour', '$88/hour', '$115/hour',
  '$105/hour', '$130/hour', '$165/hour',
  ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean Background Check'],
  ARRAY['College Degree', '2,000+ Total Time', 'International Experience', 'Spanish Language Skills', 'Caribbean/Latin America Experience'],
  ARRAY['Specialized Caribbean operations', 'Growing Latin American market', 'Miami base location', 'Smaller company benefits', 'International experience building'],
  ARRAY['Non-union carrier', 'Focus on Americas/Caribbean', 'Growing market presence', 'Competitive in regional cargo', 'Family-owned business'],
  'Miami (MIA)', 'June 2023'
);