-- Update Mesa Airlines with comprehensive data
UPDATE airlines SET
  call_sign = 'Mesa',
  pilot_group_size = '1,200+',
  fleet_size = 145,
  description = 'Regional airline based in Phoenix, Arizona. Operates CRJ-900 and Embraer 175 aircraft for United Express and American Eagle, serving smaller communities with connections to major hubs.',
  pilot_union = 'ALPA',
  is_hiring = true,
  application_url = 'https://www.mesa-air.com/careers',
  most_junior_base = 'Phoenix (PHX)',
  most_junior_captain_hire_date = 'August 2022',
  retirements_in_2025 = 35,
  fo_pay_year_1 = '$85.00/hr',
  fo_pay_year_5 = '$95.00/hr',
  fo_pay_year_10 = '$105.00/hr',
  captain_pay_year_1 = '$142.00/hr',
  captain_pay_year_5 = '$165.00/hr',
  captain_pay_year_10 = '$185.00/hr',
  fleet_info = '[
    {"type": "Embraer 175", "quantity": 85},
    {"type": "CRJ-900", "quantity": 60}
  ]'::jsonb,
  bases = ARRAY['Phoenix (PHX)', 'Houston (IAH)', 'Washington DC (IAD)', 'Denver (DEN)', 'Los Angeles (LAX)'],
  required_qualifications = ARRAY[
    'FAA ATP Certificate',
    'Minimum 1,500 hours total flight time',
    'Multi-engine land experience',
    'Valid First Class Medical Certificate',
    'FCC Restricted Radio Operators Permit'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous Part 121 experience',
    'CRJ or ERJ type rating',
    'Clean driving record',
    'Customer service experience'
  ],
  inside_scoop = ARRAY[
    'Quick upgrades to Captain (18-24 months)',
    'All Embraer 175 fleet by end of 2025',
    'Strong partnership with United Airlines',
    'Mesa Pilot Development Program available',
    'Competitive per diem rates'
  ],
  additional_info = ARRAY[
    'Founded in 1982',
    'Operates as United Express and American Eagle',
    'Hub operations in Phoenix',
    'Over 400 daily flights',
    'Strong safety record and culture'
  ]
WHERE name = 'Mesa Airlines';

-- Update Republic Airways with comprehensive data
UPDATE airlines SET
  call_sign = 'Republic',
  pilot_group_size = '2,400+',
  fleet_size = 240,
  description = 'Indianapolis-based regional airline operating the world''s largest all-Embraer 170/175 fleet. Provides scheduled passenger service with 1000 daily flights to 80+ cities across North America.',
  pilot_union = 'ALPA',
  is_hiring = true,
  application_url = 'https://careers.rjet.com/',
  most_junior_base = 'Indianapolis (IND)',
  most_junior_captain_hire_date = 'March 2023',
  retirements_in_2025 = 65,
  fo_pay_year_1 = '$91.81/hr',
  fo_pay_year_5 = '$105.00/hr',
  fo_pay_year_10 = '$115.00/hr',
  captain_pay_year_1 = '$142.81/hr',
  captain_pay_year_5 = '$180.00/hr',
  captain_pay_year_10 = '$219.99/hr',
  fleet_info = '[
    {"type": "Embraer 170", "quantity": 120},
    {"type": "Embraer 175", "quantity": 120}
  ]'::jsonb,
  bases = ARRAY['Indianapolis (IND)', 'Chicago (ORD)', 'Louisville (SDF)', 'Columbus (CMH)', 'Pittsburgh (PIT)', 'Newark (EWR)', 'Washington DC (DCA)', 'New York (LGA)', 'Philadelphia (PHL)', 'Boston (BOS)'],
  required_qualifications = ARRAY[
    'FAA ATP Certificate or ability to obtain',
    'Minimum 1,500 hours total flight time',
    'Multi-engine aircraft experience',
    'Valid First Class Medical Certificate',
    'Clean criminal background check'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree from accredited university',
    'Previous Part 121 experience',
    'Embraer type rating',
    'Clean driving record',
    'Professional appearance and demeanor'
  ],
  inside_scoop = ARRAY[
    'Delta Ready and United Ready pathways to majors',
    'No junior manning policy',
    'Deadhead pay at 100%',
    'Industry-leading training center in Carmel, IN',
    'Partnerships with American, Delta, and United'
  ],
  additional_info = ARRAY[
    'Founded in 1974',
    'Headquartered in Indianapolis',
    'State-of-the-art training facility',
    '8 full-motion flight simulators',
    'LIFT Academy flight training partnership'
  ]
WHERE name = 'Republic Airways';

-- Update SkyWest Airlines with comprehensive data
UPDATE airlines SET
  call_sign = 'SkyWest',
  pilot_group_size = '4,800+',
  fleet_size = 485,
  description = 'St. George, Utah-based regional airline operating nearly 500 aircraft with partnerships with United, Delta, American, and Alaska Airlines. Known for excellent pilot quality of life.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://www.skywest.com/careers',
  most_junior_base = 'Salt Lake City (SLC)',
  most_junior_captain_hire_date = 'January 2023',
  retirements_in_2025 = 125,
  fo_pay_year_1 = '$90.00/hr',
  fo_pay_year_5 = '$102.00/hr',
  fo_pay_year_10 = '$112.00/hr',
  captain_pay_year_1 = '$150.00/hr',
  captain_pay_year_5 = '$175.00/hr',
  captain_pay_year_10 = '$195.00/hr',
  fleet_info = '[
    {"type": "CRJ-200", "quantity": 95},
    {"type": "CRJ-700", "quantity": 85},
    {"type": "CRJ-900", "quantity": 75},
    {"type": "Embraer 175", "quantity": 230}
  ]'::jsonb,
  bases = ARRAY['Salt Lake City (SLC)', 'Los Angeles (LAX)', 'San Francisco (SFO)', 'Denver (DEN)', 'Phoenix (PHX)', 'Chicago (ORD)', 'Minneapolis (MSP)', 'Detroit (DTW)', 'Atlanta (ATL)', 'Portland (PDX)', 'Seattle (SEA)', 'Houston (IAH)', 'Dallas (DFW)', 'St. George (SGU)', 'Fresno (FAT)', 'Palm Springs (PSP)', 'Bozeman (BZN)', 'Colorado Springs (COS)', 'Rapid City (RAP)', 'Billings (BIL)'],
  required_qualifications = ARRAY[
    'FAA ATP Certificate',
    'Minimum 1,500 hours total flight time',
    'Multi-engine land experience',
    'Valid First Class Medical Certificate',
    'FCC Restricted Radio Operators Permit'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous airline experience',
    'CRJ or ERJ type rating',
    'Clean MVR and criminal background',
    '23 years of age or older'
  ],
  inside_scoop = ARRAY[
    'Rapid upgrade times (12-18 months)',
    'Profit sharing and 401k match',
    '20 domiciles for lifestyle flexibility',
    'Four mainline partner airlines',
    'Excellent work-life balance'
  ],
  additional_info = ARRAY[
    'Founded in 1972',
    'Largest regional airline in the US',
    'Operates as United Express, Delta Connection, American Eagle, Alaska SkyWest',
    'Over 2,000 daily departures',
    'Strong safety culture and record'
  ]
WHERE name = 'SkyWest Airlines';

-- Update Endeavor Air with comprehensive data  
UPDATE airlines SET
  call_sign = 'Endeavor',
  pilot_group_size = '2,100+',
  fleet_size = 134,
  description = 'Minneapolis-based regional airline operating exclusively as Delta Connection. Operates CRJ-200/700/900 aircraft throughout North America with guaranteed flow to Delta Air Lines.',
  pilot_union = 'ALPA',
  is_hiring = true,
  application_url = 'https://www.endeavorair.com/careers',
  most_junior_base = 'Minneapolis (MSP)',
  most_junior_captain_hire_date = 'June 2022',
  retirements_in_2025 = 55,
  fo_pay_year_1 = '$89.00/hr',
  fo_pay_year_5 = '$98.00/hr',
  fo_pay_year_10 = '$108.00/hr',
  captain_pay_year_1 = '$145.00/hr',
  captain_pay_year_5 = '$170.00/hr',
  captain_pay_year_10 = '$190.00/hr',
  fleet_info = '[
    {"type": "CRJ-200", "quantity": 44},
    {"type": "CRJ-700", "quantity": 30},
    {"type": "CRJ-900", "quantity": 60}
  ]'::jsonb,
  bases = ARRAY['Minneapolis (MSP)', 'Detroit (DTW)', 'New York (LGA)', 'Atlanta (ATL)', 'Cincinnati (CVG)'],
  required_qualifications = ARRAY[
    'FAA ATP Certificate or eligibility',
    'Minimum 1,500 hours total flight time',
    'Multi-engine aircraft experience',
    'Valid First Class Medical Certificate',
    'Authorization to work in the US'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree from accredited institution',
    'Previous Part 121 airline experience',
    'CRJ type rating',
    'Clean driving record',
    'Customer service oriented'
  ],
  inside_scoop = ARRAY[
    'Guaranteed flow to Delta Air Lines',
    'Delta profit sharing eligibility',
    'Retention bonuses available',
    'Quick captain upgrades',
    'Excellent training programs'
  ],
  additional_info = ARRAY[
    'Founded as Express Airlines I in 1985',
    'Became Endeavor Air in 2013',
    'Wholly-owned subsidiary of Delta Air Lines',
    'Over 900 daily departures',
    'Strong safety record and culture'
  ]
WHERE name = 'Endeavor Air';

-- Update Envoy Air with comprehensive data
UPDATE airlines SET  
  call_sign = 'Envoy',
  pilot_group_size = '2,500+',
  fleet_size = 185,
  description = 'Dallas-based regional airline operating as American Eagle. Flies Embraer 175 aircraft with guaranteed flow-through to American Airlines mainline positions.',
  pilot_union = 'APA (Allied Pilots Association)',
  is_hiring = true,
  application_url = 'https://www.envoyair.com/careers',
  most_junior_base = 'Dallas (DFW)',
  most_junior_captain_hire_date = 'October 2022',
  retirements_in_2025 = 75,
  fo_pay_year_1 = '$88.00/hr',
  fo_pay_year_5 = '$95.00/hr',
  fo_pay_year_10 = '$105.00/hr',
  captain_pay_year_1 = '$148.00/hr',
  captain_pay_year_5 = '$172.00/hr',
  captain_pay_year_10 = '$192.00/hr',
  fleet_info = '[
    {"type": "Embraer 175", "quantity": 185}
  ]'::jsonb,
  bases = ARRAY['Dallas (DFW)', 'Chicago (ORD)', 'Miami (MIA)', 'New York (LGA)'],
  required_qualifications = ARRAY[
    'FAA ATP Certificate or R-ATP eligibility',
    'Minimum 1,500 hours total flight time (or R-ATP minimums)',
    'Multi-engine land aircraft experience',
    'Valid First Class Medical Certificate',
    'Valid passport for international travel'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous airline or military experience',
    'ERJ type rating',
    'Clean background and driving record',
    'Customer service experience'
  ],
  inside_scoop = ARRAY[
    'Guaranteed flow to American Airlines',
    'American Airlines Group benefits',
    'Flow timeline typically 4-6 years',
    'Retention bonuses up to $50,000',
    'All Embraer 175 fleet'
  ],
  additional_info = ARRAY[
    'Founded in 1984 as American Eagle Airlines',
    'Renamed to Envoy Air in 2014',
    'Wholly-owned subsidiary of American Airlines',
    'Over 900 daily flights',
    'Serves over 150 destinations'
  ]
WHERE name = 'Envoy Air';

-- Update PSA Airlines with comprehensive data
UPDATE airlines SET
  call_sign = 'PSA',
  pilot_group_size = '1,800+',
  fleet_size = 125,
  description = 'Charlotte-based regional airline operating as American Eagle. Flies CRJ-700/900 aircraft throughout North America with guaranteed flow to American Airlines.',
  pilot_union = 'APA (Allied Pilots Association)', 
  is_hiring = true,
  application_url = 'https://www.psaairlines.com/careers',
  most_junior_base = 'Charlotte (CLT)',
  most_junior_captain_hire_date = 'September 2022',
  retirements_in 2025 = 45,
  fo_pay_year_1 = '$99.00/hr',
  fo_pay_year_5 = '$114.00/hr',
  fo_pay_year_10 = '$117.75/hr',
  captain_pay_year_1 = '$157.50/hr',
  captain_pay_year_5 = '$176.25/hr',
  captain_pay_year_10 = '$195.00/hr',
  fleet_info = '[
    {"type": "CRJ-700", "quantity": 55},
    {"type": "CRJ-900", "quantity": 70}
  ]'::jsonb,
  bases = ARRAY['Charlotte (CLT)', 'Philadelphia (PHL)', 'Washington DC (DCA)', 'Knoxville (TYS)'],
  required_qualifications = ARRAY[
    'FAA ATP Certificate',
    'Minimum 1,500 hours total flight time',
    'Multi-engine land experience',
    'Valid First Class Medical Certificate',
    'Clean background check'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous Part 121 experience', 
    'CRJ type rating',
    'Clean driving record',
    'Professional appearance'
  ],
  inside_scoop = ARRAY[
    'Guaranteed flow to American Airlines',
    'Quick captain upgrades (18-24 months)',
    'Industry-leading pay rates',
    'American Airlines Group benefits',
    'New Knoxville base opening 2025'
  ],
  additional_info = ARRAY[
    'Founded in 1979',
    'Wholly-owned subsidiary of American Airlines',
    'Relocating headquarters to Charlotte',
    'Over 700 daily flights', 
    'Strong safety culture'
  ]
WHERE name = 'PSA Airlines';

-- Update Piedmont Airlines with comprehensive data
UPDATE airlines SET
  call_sign = 'Piedmont',
  pilot_group_size = '1,400+', 
  fleet_size = 90,
  description = 'Salisbury, Maryland-based regional airline operating as American Eagle. Flies Embraer 145 aircraft with guaranteed flow to American Airlines and competitive compensation.',
  pilot_union = 'APA (Allied Pilots Association)',
  is_hiring = true,
  application_url = 'https://piedmont-airlines.com/careers',
  most_junior_base = 'Philadelphia (PHL)',
  most_junior_captain_hire_date = 'July 2022',
  retirements_in_2025 = 35,
  fo_pay_year_1 = '$91.00/hr',
  fo_pay_year_5 = '$98.00/hr', 
  fo_pay_year_10 = '$105.00/hr',
  captain_pay_year_1 = '$155.00/hr',
  captain_pay_year_5 = '$175.00/hr',
  captain_pay_year_10 = '$190.00/hr',
  fleet_info = '[
    {"type": "Embraer 145", "quantity": 90}
  ]'::jsonb,
  bases = ARRAY['Philadelphia (PHL)', 'Charlotte (CLT)', 'Harrisburg (MDT)'],
  required_qualifications = ARRAY[
    'FAA ATP Certificate or R-ATP eligibility',
    'Minimum 1,500 hours total flight time (or R-ATP minimums)',
    'Multi-engine land experience',
    'Valid First Class Medical Certificate', 
    'Valid passport'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree from accredited university',
    'Previous airline experience',
    'ERJ type rating',
    'Clean MVR and background check',
    'Customer service oriented'
  ],
  inside_scoop = ARRAY[
    'Guaranteed flow to American Airlines (4.5-6 years)',
    'First year pay guarantee $100,000+',
    'Quick captain upgrades',
    'American Airlines Group benefits', 
    'Excellent work-life balance'
  ],
  additional_info = ARRAY[
    'Founded in 1961',
    'Wholly-owned subsidiary of American Airlines',
    'Based in Salisbury, Maryland',
    'Over 400 daily departures',
    'Strong company culture and values'
  ]
WHERE name = 'Piedmont Airlines';

-- Update Horizon Air with comprehensive data
UPDATE airlines SET
  call_sign = 'Horizon',
  pilot_group_size = '1,200+',
  fleet_size = 85,
  description = 'Seattle-based regional airline operating as Alaska Airlines. Flies Embraer 175 and De Havilland Q400 aircraft throughout the western United States and Canada.',
  pilot_union = 'ALPA',
  is_hiring = true,
  application_url = 'https://careers.alaskaair.com/',
  most_junior_base = 'Seattle (SEA)',
  most_junior_captain_hire_date = 'November 2022',
  retirements_in_2025 = 30,
  fo_pay_year_1 = '$92.72/hr',
  fo_pay_year_5 = '$102.00/hr',
  fo_pay_year_10 = '$112.00/hr',
  captain_pay_year_1 = '$153.68/hr',
  captain_pay_year_5 = '$175.00/hr',
  captain_pay_year_10 = '$195.00/hr',
  fleet_info = '[
    {"type": "Embraer 175", "quantity": 45},
    {"type": "De Havilland Dash 8 Q400", "quantity": 40}
  ]'::jsonb,
  bases = ARRAY['Seattle (SEA)', 'Portland (PDX)', 'Los Angeles (LAX)', 'San Francisco (SFO)', 'Boise (BOI)'],
  required_qualifications = ARRAY[
    'FAA ATP Certificate',
    'Minimum 1,500 hours total flight time',
    'Multi-engine aircraft experience',
    'Valid First Class Medical Certificate',
    'Authorization to work in the US'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous airline experience',
    'ERJ or Q400 type rating',
    'Clean driving and criminal record',
    'West Coast location preference'
  ],
  inside_scoop = ARRAY[
    'Path to Alaska Airlines mainline',
    'Excellent west coast lifestyle',
    'Alaska Airlines benefits package',
    'Strong company culture and values',
    'Beautiful flying throughout the Pacific Northwest'
  ],
  additional_info = ARRAY[
    'Founded in 1981',
    'Wholly-owned subsidiary of Alaska Airlines',
    'Based in Seattle, Washington',
    'Serves over 50 destinations',
    'Focus on west coast and Alaska operations'
  ]
WHERE name = 'Horizon Air';