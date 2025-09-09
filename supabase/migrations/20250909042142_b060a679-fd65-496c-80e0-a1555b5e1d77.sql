-- Update remaining fractional carriers with comprehensive data

-- Update Jet Linx
UPDATE airlines SET
  call_sign = 'Jet Linx',
  pilot_group_size = '800+',
  fleet_size = 120,
  description = 'Private jet management and jet card company with locations nationwide. Offers flexible scheduling options and diverse fleet of business aircraft.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://www.jetlinx.com/careers',
  most_junior_base = 'Omaha (OMA)',
  most_junior_captain_hire_date = 'September 2020',
  retirements_in_2025 = 25,
  fo_pay_year_1 = '$78,000',
  fo_pay_year_5 = '$92,000',
  fo_pay_year_10 = '$108,000',
  captain_pay_year_1 = '$135,000',
  captain_pay_year_5 = '$160,000',
  captain_pay_year_10 = '$185,000',
  fleet_info = '[
    {"type": "Citation CJ2+/CJ3+", "quantity": 25},
    {"type": "Citation XLS/XLS+", "quantity": 30},
    {"type": "Citation Sovereign", "quantity": 20},
    {"type": "Hawker 800XP/900XP", "quantity": 25},
    {"type": "Challenger 300/350", "quantity": 20}
  ]'::jsonb,
  bases = ARRAY['Omaha (OMA)', 'Denver (APA)', 'Dallas (ADS)', 'Chicago (PWK)', 'Scottsdale (SDL)', 'Houston (SGR)', 'Atlanta (PDK)', 'Tulsa (TUL)', 'Detroit (DET)'],
  required_qualifications = ARRAY[
    'ATP certificate or meet requirements',
    'Minimum 2,500 hours total flight time',
    'Multi-engine turbine experience',
    'Valid First Class Medical Certificate',
    'Type rating in fleet aircraft'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous Part 135 experience',
    'Multiple type ratings',
    'Customer service background',
    'Professional presentation'
  ],
  inside_scoop = ARRAY[
    'Flex, Fixed, or Free schedule options',
    'Home-based assigned to local base',
    'Local market focus',
    'Strong company culture',
    'Growing nationwide presence'
  ],
  additional_info = ARRAY[
    'Founded in 1999',
    'Headquartered in Omaha, Nebraska',
    'Local market approach',
    'Multiple base locations',
    'Strong pilot retention'
  ]
WHERE name = 'Jet Linx';

-- Update VistaJet (if exists)
UPDATE airlines SET
  call_sign = 'Vista',
  pilot_group_size = '2,800+',
  fleet_size = 350,
  description = 'Global business aviation company offering private jet flights worldwide. Based in Malta with extensive international operations and ultra-long range fleet.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://careers.vistajet.com',
  most_junior_base = 'Various International',
  most_junior_captain_hire_date = 'January 2021',
  retirements_in_2025 = 95,
  fo_pay_year_1 = '$95,000',
  fo_pay_year_5 = '$115,000',
  fo_pay_year_10 = '$135,000',
  captain_pay_year_1 = '$155,000',
  captain_pay_year_5 = '$185,000',
  captain_pay_year_10 = '$215,000',
  fleet_info = '[
    {"type": "Challenger 350", "quantity": 75},
    {"type": "Global Express/XRS", "quantity": 85},
    {"type": "Global 5000/6000", "quantity": 95},
    {"type": "Global 7500", "quantity": 45},
    {"type": "Gulfstream G650/G650ER", "quantity": 50}
  ]'::jsonb,
  bases = ARRAY['Various international locations', 'Teterboro (TEB)', 'Palm Beach (PBI)', 'London', 'Dubai', 'Hong Kong'],
  required_qualifications = ARRAY[
    'ATPL or ATP equivalent',
    'Minimum 3,000 hours total flight time',
    'Type rating in large cabin aircraft',
    'Valid Class 1 Medical Certificate',
    'Valid passports for international travel'
  ],
  preferred_qualifications = ARRAY[
    'University degree',
    'International flying experience',
    'Multiple type ratings',
    'Multilingual capabilities',
    'High-end customer service experience'
  ],
  inside_scoop = ARRAY[
    'Global operations - fly worldwide',
    'Ultra-long range aircraft',
    'International crew bases',
    'High-end clientele',
    'Comprehensive benefits package'
  ],
  additional_info = ARRAY[
    'Founded in 2004',
    'Based in Malta',
    'Global fleet operations',
    'Ultra-luxury service focus',
    '187 countries served'
  ]
WHERE name = 'VistaJet';

-- Update XOJet
UPDATE airlines SET
  call_sign = 'XOJet',
  pilot_group_size = '600+',
  fleet_size = 90,
  description = 'On-demand private jet charter and membership company offering access to diverse fleet of business aircraft with focus on technology and customer service.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://xojet.com/careers',
  most_junior_base = 'San Francisco (SQL)',
  most_junior_captain_hire_date = 'August 2020',
  retirements_in_2025 = 18,
  fo_pay_year_1 = '$85,000',
  fo_pay_year_5 = '$100,000',
  fo_pay_year_10 = '$115,000',
  captain_pay_year_1 = '$140,000',
  captain_pay_year_5 = '$165,000',
  captain_pay_year_10 = '$190,000',
  fleet_info = '[
    {"type": "Citation X/XLS", "quantity": 25},
    {"type": "Challenger 300", "quantity": 20},
    {"type": "Challenger 650", "quantity": 15},
    {"type": "Gulfstream G450", "quantity": 18},
    {"type": "Gulfstream G650", "quantity": 12}
  ]'::jsonb,
  bases = ARRAY['San Francisco (SQL)', 'Los Angeles (VNY)', 'Las Vegas (LAS)', 'Denver (APA)', 'Dallas (ADS)'],
  required_qualifications = ARRAY[
    'ATP certificate',
    'Minimum 2,500 hours total flight time',
    'Multi-engine turbine experience',
    'Valid First Class Medical Certificate',
    'Type rating preferred'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous Part 135 experience',
    'Large cabin experience',
    'Technology proficiency',
    'Customer service excellence'
  ],
  inside_scoop = ARRAY[
    'Technology-focused operations',
    'On-demand charter model',
    'West Coast focus',
    'High-tech fleet',
    'Innovation-driven company'
  ],
  additional_info = ARRAY[
    'Technology-focused charter company',
    'West Coast operations',
    'On-demand service model',
    'Modern fleet',
    'Customer experience focus'
  ]
WHERE name = 'XOJet';