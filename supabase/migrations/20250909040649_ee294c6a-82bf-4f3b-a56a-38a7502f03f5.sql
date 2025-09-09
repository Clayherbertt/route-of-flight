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