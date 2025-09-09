-- Update Regional Carriers with comprehensive pay, seniority, and fleet information

-- Mesa Airlines (American Eagle, United Express)
UPDATE airlines SET 
  fo_pay_year_1 = '$52.00/hr',
  fo_pay_year_5 = '$63.00/hr',
  fo_pay_year_10 = '$74.00/hr',
  captain_pay_year_1 = '$89.00/hr',
  captain_pay_year_5 = '$102.00/hr',
  captain_pay_year_10 = '$115.00/hr',
  most_junior_base = 'Phoenix (PHX)',
  most_junior_captain_hire_date = '2019',
  retirements_in_2025 = 85,
  required_qualifications = ARRAY[
    '1,500 total flight hours',
    'ATP license or ability to obtain',
    'Clean driving record',
    'First Class Medical Certificate',
    'Valid passport'
  ],
  preferred_qualifications = ARRAY[
    'Part 121 experience',
    '1,000 hours turbine time',
    'Bachelor''s degree',
    'Multi-engine rating'
  ],
  fleet_info = '[
    {"type": "CRJ-900", "quantity": "78"},
    {"type": "ERJ-175", "quantity": "67"}
  ]'::jsonb,
  inside_scoop = ARRAY[
    'Good training program with consistent schedules',
    'Quick upgrade times - often 2-3 years to Captain',
    'Strong partnership with American and United'
  ],
  additional_info = ARRAY[
    'Per diem: $2.40/hour',
    '401k match up to 6%',
    'Health, dental, vision insurance',
    'Travel benefits on partner airlines'
  ]
WHERE name = 'Mesa Airlines';

-- Endeavor Air (Delta Connection)
UPDATE airlines SET 
  fo_pay_year_1 = '$60.00/hr',
  fo_pay_year_5 = '$72.00/hr',
  fo_pay_year_10 = '$84.00/hr',
  captain_pay_year_1 = '$98.00/hr',
  captain_pay_year_5 = '$112.00/hr',
  captain_pay_year_10 = '$126.00/hr',
  most_junior_base = 'Cincinnati (CVG)',
  most_junior_captain_hire_date = '2020',
  retirements_in_2025 = 45,
  required_qualifications = ARRAY[
    '1,500 total flight hours',
    'ATP license or ability to obtain',
    'Clean MVR and background',
    'First Class Medical Certificate',
    'Valid passport'
  ],
  preferred_qualifications = ARRAY[
    'Part 121 experience',
    '1,000 hours turbine time',
    'Bachelor''s degree',
    'CRJ type rating'
  ],
  fleet_info = '[
    {"type": "CRJ-200", "quantity": "44"},
    {"type": "CRJ-900", "quantity": "134"}
  ]'::jsonb,
  inside_scoop = ARRAY[
    'Strong flow-through program to Delta Air Lines',
    'Excellent training facilities in Atlanta',
    'Delta benefits and travel privileges'
  ],
  additional_info = ARRAY[
    'Per diem: $2.55/hour',
    'Flow-through to Delta mainline',
    '401k match up to 6%',
    'Comprehensive benefits package'
  ]
WHERE name = 'Endeavor Air';

-- Republic Airways (American Eagle, Delta Connection, United Express)
UPDATE airlines SET 
  fo_pay_year_1 = '$54.00/hr',
  fo_pay_year_5 = '$66.00/hr',
  fo_pay_year_10 = '$78.00/hr',
  captain_pay_year_1 = '$92.00/hr',
  captain_pay_year_5 = '$106.00/hr',
  captain_pay_year_10 = '$120.00/hr',
  most_junior_base = 'Indianapolis (IND)',
  most_junior_captain_hire_date = '2018',
  retirements_in_2025 = 120,
  required_qualifications = ARRAY[
    '1,500 total flight hours',
    'ATP license or ability to obtain',
    'Clean driving record',
    'First Class Medical Certificate',
    'Valid passport'
  ],
  preferred_qualifications = ARRAY[
    'Part 121 experience',
    '1,000 hours turbine time',
    'Bachelor''s degree',
    'EMB-170/175 experience'
  ],
  fleet_info = '[
    {"type": "EMB-170", "quantity": "102"},
    {"type": "EMB-175", "quantity": "118"}
  ]'::jsonb,
  inside_scoop = ARRAY[
    'Multiple partner airlines provide variety',
    'Good training program in Indianapolis',
    'Rapid Captain upgrades available'
  ],
  additional_info = ARRAY[
    'Per diem: $2.35/hour',
    '401k match up to 6%',
    'Health benefits available',
    'Travel benefits on all partner airlines'
  ]
WHERE name = 'Republic Airways';

-- SkyWest (American Eagle, Delta Connection, United Express, Alaska Airlines)
UPDATE airlines SET 
  fo_pay_year_1 = '$56.00/hr',
  fo_pay_year_5 = '$68.00/hr',
  fo_pay_year_10 = '$80.00/hr',
  captain_pay_year_1 = '$95.00/hr',
  captain_pay_year_5 = '$109.00/hr',
  captain_pay_year_10 = '$123.00/hr',
  most_junior_base = 'Salt Lake City (SLC)',
  most_junior_captain_hire_date = '2019',
  retirements_in_2025 = 200,
  required_qualifications = ARRAY[
    '1,500 total flight hours',
    'ATP license or ability to obtain',
    'Clean driving record',
    'First Class Medical Certificate',
    'Valid passport'
  ],
  preferred_qualifications = ARRAY[
    'Part 121 experience',
    '1,000 hours turbine time',
    'Bachelor''s degree',
    'CRJ or EMB type rating'
  ],
  fleet_info = '[
    {"type": "CRJ-200", "quantity": "96"},
    {"type": "CRJ-700", "quantity": "94"},
    {"type": "CRJ-900", "quantity": "82"},
    {"type": "EMB-120", "quantity": "14"},
    {"type": "EMB-175", "quantity": "124"}
  ]'::jsonb,
  inside_scoop = ARRAY[
    'Largest regional airline in North America',
    'Multiple partner airlines provide flexibility',
    'Strong safety record and training program'
  ],
  additional_info = ARRAY[
    'Per diem: $2.45/hour',
    '401k match up to 6%',
    'Comprehensive health benefits',
    'Travel privileges on all partner airlines'
  ]
WHERE name = 'SkyWest';

-- Envoy Air (American Eagle)
UPDATE airlines SET 
  fo_pay_year_1 = '$58.00/hr',
  fo_pay_year_5 = '$70.00/hr',
  fo_pay_year_10 = '$82.00/hr',
  captain_pay_year_1 = '$96.00/hr',
  captain_pay_year_5 = '$110.00/hr',
  captain_pay_year_10 = '$124.00/hr',
  most_junior_base = 'New York (LGA)',
  most_junior_captain_hire_date = '2020',
  retirements_in_2025 = 65,
  required_qualifications = ARRAY[
    '1,500 total flight hours',
    'ATP license or ability to obtain',
    'Clean MVR and background',
    'First Class Medical Certificate',
    'Valid passport'
  ],
  preferred_qualifications = ARRAY[
    'Part 121 experience',
    '1,000 hours turbine time',
    'Bachelor''s degree',
    'EMB-175 experience'
  ],
  fleet_info = '[
    {"type": "EMB-175", "quantity": "178"}
  ]'::jsonb,
  inside_scoop = ARRAY[
    'All EMB-175 fleet - consistent aircraft type',
    'American Airlines flow-through program',
    'Excellent benefits matching American'
  ],
  additional_info = ARRAY[
    'Per diem: $2.60/hour',
    'Flow-through to American Airlines',
    '401k match up to 6%',
    'American Airlines travel benefits'
  ]
WHERE name = 'Envoy Air';

-- PSA Airlines (American Eagle)
UPDATE airlines SET 
  fo_pay_year_1 = '$56.00/hr',
  fo_pay_year_5 = '$68.00/hr',
  fo_pay_year_10 = '$80.00/hr',
  captain_pay_year_1 = '$94.00/hr',
  captain_pay_year_5 = '$108.00/hr',
  captain_pay_year_10 = '$122.00/hr',
  most_junior_base = 'Charlotte (CLT)',
  most_junior_captain_hire_date = '2019',
  retirements_in_2025 = 55,
  required_qualifications = ARRAY[
    '1,500 total flight hours',
    'ATP license or ability to obtain',
    'Clean driving record',
    'First Class Medical Certificate',
    'Valid passport'
  ],
  preferred_qualifications = ARRAY[
    'Part 121 experience',
    '1,000 hours turbine time',
    'Bachelor''s degree',
    'CRJ experience'
  ],
  fleet_info = '[
    {"type": "CRJ-700", "quantity": "52"},
    {"type": "CRJ-900", "quantity": "88"}
  ]'::jsonb,
  inside_scoop = ARRAY[
    'American Airlines flow-through available',
    'Based primarily in American hub cities',
    'Good upgrade times to Captain'
  ],
  additional_info = ARRAY[
    'Per diem: $2.50/hour',
    'Flow-through to American Airlines',
    '401k match up to 6%',
    'American Airlines benefits'
  ]
WHERE name = 'PSA Airlines';

-- Piedmont Airlines (American Eagle)
UPDATE airlines SET 
  fo_pay_year_1 = '$55.00/hr',
  fo_pay_year_5 = '$67.00/hr',
  fo_pay_year_10 = '$79.00/hr',
  captain_pay_year_1 = '$93.00/hr',
  captain_pay_year_5 = '$107.00/hr',
  captain_pay_year_10 = '$121.00/hr',
  most_junior_base = 'Philadelphia (PHL)',
  most_junior_captain_hire_date = '2020',
  retirements_in_2025 = 48,
  required_qualifications = ARRAY[
    '1,500 total flight hours',
    'ATP license or ability to obtain',
    'Clean MVR and background',
    'First Class Medical Certificate',
    'Valid passport'
  ],
  preferred_qualifications = ARRAY[
    'Part 121 experience',
    '1,000 hours turbine time',
    'Bachelor''s degree',
    'DHC-8 experience'
  ],
  fleet_info = '[
    {"type": "DHC-8-200", "quantity": "12"},
    {"type": "DHC-8-300", "quantity": "53"},
    {"type": "EMB-145", "quantity": "75"}
  ]'::jsonb,
  inside_scoop = ARRAY[
    'Mix of turboprop and jet flying',
    'American Airlines flow-through program',
    'Strong East Coast route network'
  ],
  additional_info = ARRAY[
    'Per diem: $2.45/hour',
    'Flow-through to American Airlines',
    '401k match up to 6%',
    'Turboprop and jet experience'
  ]
WHERE name = 'Piedmont Airlines';

-- Horizon Air (Alaska Airlines)
UPDATE airlines SET 
  fo_pay_year_1 = '$62.00/hr',
  fo_pay_year_5 = '$74.00/hr',
  fo_pay_year_10 = '$86.00/hr',
  captain_pay_year_1 = '$100.00/hr',
  captain_pay_year_5 = '$114.00/hr',
  captain_pay_year_10 = '$128.00/hr',
  most_junior_base = 'Portland (PDX)',
  most_junior_captain_hire_date = '2021',
  retirements_in_2025 = 35,
  required_qualifications = ARRAY[
    '1,500 total flight hours',
    'ATP license or ability to obtain',
    'Clean driving record',
    'First Class Medical Certificate',
    'Valid passport'
  ],
  preferred_qualifications = ARRAY[
    'Part 121 experience',
    '1,000 hours turbine time',
    'Bachelor''s degree',
    'EMB-175 experience'
  ],
  fleet_info = '[
    {"type": "EMB-175", "quantity": "35"},
    {"type": "DHC-8-400", "quantity": "32"}
  ]'::jsonb,
  inside_scoop = ARRAY[
    'Direct flow to Alaska Airlines mainline',
    'Beautiful Pacific Northwest routes',
    'Excellent company culture matching Alaska'
  ],
  additional_info = ARRAY[
    'Per diem: $2.65/hour',
    'Flow-through to Alaska Airlines',
    '401k match up to 6%',
    'Alaska Airlines travel benefits'
  ]
WHERE name = 'Horizon Air';