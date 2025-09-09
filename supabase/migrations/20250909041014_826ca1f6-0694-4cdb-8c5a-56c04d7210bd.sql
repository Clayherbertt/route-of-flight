-- Update Endeavor Air and Envoy Air with comprehensive data
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