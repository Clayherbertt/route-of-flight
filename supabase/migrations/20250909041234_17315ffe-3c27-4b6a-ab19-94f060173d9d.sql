-- Update PSA Airlines, Piedmont Airlines, and Horizon Air with comprehensive data
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
  retirements_in_2025 = 45,
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