-- Update Jet Linx with comprehensive data
UPDATE airlines SET
  call_sign = 'Jet Linx',
  pilot_group_size = '800+',
  fleet_size = 120,
  description = 'Omaha, Nebraska-based private jet management and jet card company with locations nationwide. Operates diverse fleet with local market focus.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://www.jetlinx.com/careers',
  most_junior_base = 'Omaha (OMA)',
  most_junior_captain_hire_date = 'October 2021',
  retirements_in_2025 = 25,
  fo_pay_year_1 = '$75,000',
  fo_pay_year_5 = '$90,000',
  fo_pay_year_10 = '$105,000',
  captain_pay_year_1 = '$130,000',
  captain_pay_year_5 = '$155,000',
  captain_pay_year_10 = '$180,000',
  fleet_info = '[
    {"type": "Citation CJ2+", "quantity": 25},
    {"type": "Citation CJ3+", "quantity": 20},
    {"type": "Citation XLS+", "quantity": 25},
    {"type": "Hawker 800XP", "quantity": 15},
    {"type": "Challenger 300", "quantity": 20},
    {"type": "King Air 350", "quantity": 15}
  ]'::jsonb,
  bases = ARRAY['Omaha (OMA)', 'Atlanta (PDK)', 'Boston (BED)', 'Chicago (PWK)', 'Dallas (ADS)', 'Denver (APA)', 'Houston (SGR)', 'Indianapolis (TYQ)', 'Kansas City (OJC)', 'Milwaukee (UES)', 'Minneapolis (FCM)', 'Oklahoma City (PWA)', 'Portland (HIO)', 'San Antonio (SAT)', 'St. Louis (SUS)', 'Tulsa (RVS)'],
  required_qualifications = ARRAY[
    'Commercial multi-engine certificate',
    'Minimum 1,500 hours total flight time',
    'Multi-engine experience',
    'Valid First or Second Class Medical',
    'Clean background check'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous Part 135 experience',
    'Type ratings in Jet Linx aircraft',
    'Turbine experience',
    'Local market knowledge'
  ],
  inside_scoop = ARRAY[
    'Local market focus with dedicated bases',
    'Jet card and management services',
    'Growing company with expansion plans',
    'Strong customer relationships',
    'Competitive compensation and benefits'
  ],
  additional_info = ARRAY[
    'Founded in 1999',
    'Based in Omaha, Nebraska',
    'Multiple base locations nationwide',
    'Focus on personalized service',
    'Strong safety culture'
  ]
WHERE name = 'Jet Linx';