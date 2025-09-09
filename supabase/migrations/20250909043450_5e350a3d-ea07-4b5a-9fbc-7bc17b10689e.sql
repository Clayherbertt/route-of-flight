-- Update remaining cargo airlines with comprehensive data for 2025

-- Update Kalitta Air
UPDATE airlines SET 
  logo = '✈️',
  call_sign = 'Connie',
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
  most_junior_captain_hire_date = 'September 2021'
WHERE name = 'Kalitta Air';

-- Update Southern Air
UPDATE airlines SET 
  logo = '🇺🇸',
  call_sign = 'Southern Air',
  pilot_group_size = '450+',
  description = 'A cargo airline specializing in express freight, charter, and military contract services. Part of the Atlas Air Worldwide Holdings family, operating primarily Boeing 777 freighters.',
  pilot_union = 'Teamsters Local 1224',
  fleet_size = 18,
  fleet_info = '[
    {"aircraft": "Boeing 777F", "count": 14, "notes": "Primary fleet type"},
    {"aircraft": "Boeing 747-400F", "count": 4, "notes": "Heavy cargo operations"}
  ]'::jsonb,
  is_hiring = false,
  retirements_in_2025 = 2,
  bases = ARRAY['Miami (MIA)', 'Anchorage (ANC)', 'Cincinnati (CVG)'],
  fo_pay_year_1 = '$75/hour',
  fo_pay_year_5 = '$120/hour',
  fo_pay_year_10 = '$155/hour',
  captain_pay_year_1 = '$140/hour',
  captain_pay_year_5 = '$185/hour',
  captain_pay_year_10 = '$235/hour',
  required_qualifications = ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '500 Multi-Engine Time', 'Clean Background Check'],
  preferred_qualifications = ARRAY['College Degree', '2,500+ Total Time', 'International Experience', 'Heavy Aircraft Experience', 'Military Background'],
  inside_scoop = ARRAY['Atlas Air family benefits', 'Modern Boeing 777F fleet', 'International operations', 'Military contract work', 'Miami base advantages'],
  additional_info = ARRAY['Part of Atlas Air group', 'Focus on 777F operations', 'DHL and military contracts', 'Limited hiring currently', 'Merger considerations ongoing'],
  most_junior_base = 'Miami (MIA)',
  most_junior_captain_hire_date = 'April 2020'
WHERE name = 'Southern Air';

-- Update ABX Air
UPDATE airlines SET 
  logo = '📮',
  call_sign = 'Abex',
  pilot_group_size = '350+',
  description = 'An American cargo airline operating primarily under contract to DHL Express. ABX Air provides domestic air cargo transportation services with a focus on overnight and express delivery.',
  pilot_union = 'Teamsters Local 1224',
  fleet_size = 25,
  fleet_info = '[
    {"aircraft": "Boeing 767-200F", "count": 15, "notes": "DHL contract flying"},
    {"aircraft": "Boeing 767-300F", "count": 10, "notes": "DHL contract flying"}
  ]'::jsonb,
  is_hiring = false,
  retirements_in_2025 = 5,
  bases = ARRAY['Wilmington (ILN)', 'Toledo (TOL)'],
  fo_pay_year_1 = '$70/hour',
  fo_pay_year_5 = '$105/hour',
  fo_pay_year_10 = '$135/hour',
  captain_pay_year_1 = '$120/hour',
  captain_pay_year_5 = '$155/hour',
  captain_pay_year_10 = '$195/hour',
  required_qualifications = ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean Background Check'],
  preferred_qualifications = ARRAY['College Degree Preferred', '2,000+ Total Time', 'Cargo Experience', 'DHL System Knowledge', 'Teamster Experience'],
  inside_scoop = ARRAY['Long-term DHL contract', 'Domestic cargo operations', 'Steady schedules', 'Ohio-based operation', 'Established carrier'],
  additional_info = ARRAY['Primary DHL contractor', 'Mostly domestic flying', 'Stable but limited growth', 'Older fleet considerations', 'Contract dependency'],
  most_junior_base = 'Wilmington (ILN)',
  most_junior_captain_hire_date = 'November 2019'
WHERE name = 'ABX Air';