-- Update final cargo airlines with comprehensive data for 2025

-- Update Polar Air Cargo
UPDATE airlines SET 
  logo = '🐻',
  call_sign = 'Polar',
  pilot_group_size = '280+',
  description = 'An American cargo airline providing scheduled and charter freight services. Operates primarily Boeing 747 freighters with a focus on trans-Pacific routes and international cargo operations.',
  pilot_union = 'Teamsters Local 1224',
  fleet_size = 12,
  fleet_info = '[
    {"aircraft": "Boeing 747-400F", "count": 8, "notes": "Long-haul freighter"},
    {"aircraft": "Boeing 747-8F", "count": 4, "notes": "Latest generation"}
  ]'::jsonb,
  is_hiring = false,
  retirements_in_2025 = 3,
  bases = ARRAY['Purchase (PUR/JFK)', 'Anchorage (ANC)'],
  fo_pay_year_1 = '$74/hour',
  fo_pay_year_5 = '$115/hour',
  fo_pay_year_10 = '$150/hour',
  captain_pay_year_1 = '$135/hour',
  captain_pay_year_5 = '$175/hour',
  captain_pay_year_10 = '$225/hour',
  required_qualifications = ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '500 Multi-Engine Time', 'International Experience Required'],
  preferred_qualifications = ARRAY['College Degree', '3,000+ Total Time', 'Heavy Aircraft Experience', 'Pacific Routes Experience', 'Asian Operations Knowledge'],
  inside_scoop = ARRAY['Atlas Air family carrier', 'International 747 operations', 'Trans-Pacific specialists', 'New York area based', 'Experienced pilot group'],
  additional_info = ARRAY['Part of Atlas Air group', 'Focus on Asia-Pacific routes', 'All 747 operations', 'Limited hiring', 'Niche market position'],
  most_junior_base = 'Purchase (PUR)',
  most_junior_captain_hire_date = 'February 2018'
WHERE name = 'Polar Air Cargo';

-- Update Western Global Airlines
UPDATE airlines SET 
  logo = '🌎',
  call_sign = 'Western Global',
  pilot_group_size = '180+',
  description = 'A cargo airline providing domestic and international freight services. Operates a fleet of MD-11 freighters serving routes across the Americas, with growing operations in South America.',
  pilot_union = 'Non-Union',
  fleet_size = 8,
  fleet_info = '[
    {"aircraft": "Boeing MD-11F", "count": 6, "notes": "Primary fleet type"},
    {"aircraft": "Boeing 747-400F", "count": 2, "notes": "Heavy cargo ops"}
  ]'::jsonb,
  is_hiring = true,
  retirements_in_2025 = 1,
  bases = ARRAY['Miami (MIA)', 'Aguadilla (BQN)'],
  fo_pay_year_1 = '$68/hour',
  fo_pay_year_5 = '$95/hour',
  fo_pay_year_10 = '$125/hour',
  captain_pay_year_1 = '$115/hour',
  captain_pay_year_5 = '$145/hour',
  captain_pay_year_10 = '$185/hour',
  required_qualifications = ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean Background Check'],
  preferred_qualifications = ARRAY['College Degree Preferred', '2,000+ Total Time', 'International Experience', 'Spanish Language Skills', 'Latin America Experience'],
  inside_scoop = ARRAY['Growing carrier with opportunities', 'International operations focus', 'Latin American routes', 'Smaller company culture', 'Direct access to management'],
  additional_info = ARRAY['Non-union environment', 'Focus on Americas routes', 'Growing South American operations', 'Miami-based operations', 'Entrepreneurial culture'],
  most_junior_base = 'Miami (MIA)',
  most_junior_captain_hire_date = 'August 2022'
WHERE name = 'Western Global Airlines';

-- Update Amerijet International
UPDATE airlines SET 
  logo = '🚛',
  call_sign = 'Amerijet',
  pilot_group_size = '120+',
  description = 'A cargo airline specializing in express freight services throughout the Americas. Known for operations to the Caribbean, Central America, and South America with both scheduled and charter services.',
  pilot_union = 'Non-Union',
  fleet_size = 12,
  fleet_info = '[
    {"aircraft": "Boeing 767-300F", "count": 8, "notes": "Primary cargo aircraft"},
    {"aircraft": "Boeing 737-400F", "count": 4, "notes": "Short-haul cargo"}
  ]'::jsonb,
  is_hiring = true,
  retirements_in_2025 = 2,
  bases = ARRAY['Miami (MIA)', 'Fort Lauderdale (FLL)'],
  fo_pay_year_1 = '$65/hour',
  fo_pay_year_5 = '$88/hour',
  fo_pay_year_10 = '$115/hour',
  captain_pay_year_1 = '$105/hour',
  captain_pay_year_5 = '$130/hour',
  captain_pay_year_10 = '$165/hour',
  required_qualifications = ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean Background Check'],
  preferred_qualifications = ARRAY['College Degree', '2,000+ Total Time', 'International Experience', 'Spanish Language Skills', 'Caribbean/Latin America Experience'],
  inside_scoop = ARRAY['Specialized Caribbean operations', 'Growing Latin American market', 'Miami base location', 'Smaller company benefits', 'International experience building'],
  additional_info = ARRAY['Non-union carrier', 'Focus on Americas/Caribbean', 'Growing market presence', 'Competitive in regional cargo', 'Family-owned business'],
  most_junior_base = 'Miami (MIA)',
  most_junior_captain_hire_date = 'June 2023'
WHERE name = 'Amerijet International';