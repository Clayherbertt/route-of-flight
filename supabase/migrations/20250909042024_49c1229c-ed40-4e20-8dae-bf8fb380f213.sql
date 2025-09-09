-- Update remaining fractional carriers with comprehensive data

-- Update PlaneSense
UPDATE airlines SET
  call_sign = 'Chronos',
  pilot_group_size = '300+',
  fleet_size = 45,
  description = 'Portsmouth, New Hampshire-based fractional ownership program specializing in Pilatus PC-12 and PC-24 aircraft. Largest civilian operator of PC-12s.',
  pilot_union = 'Non-unionized',
  is_hiring = false,
  application_url = 'https://www.planesense.com/careers',
  most_junior_base = 'Portsmouth (PSM)',
  most_junior_captain_hire_date = 'June 2019',
  retirements_in_2025 = 15,
  fo_pay_year_1 = '$65,000',
  fo_pay_year_5 = '$75,000',
  fo_pay_year_10 = '$85,000',
  captain_pay_year_1 = '$95,000',
  captain_pay_year_5 = '$110,000',
  captain_pay_year_10 = '$125,000',
  fleet_info = '[
    {"type": "Pilatus PC-12", "quantity": 35},
    {"type": "Pilatus PC-24", "quantity": 10}
  ]'::jsonb,
  bases = ARRAY['Portsmouth (PSM)', 'Boston (BOS)', 'White Plains (HPN)'],
  required_qualifications = ARRAY[
    'Commercial Multi-Engine Land certificate',
    'Minimum 750 hours total flight time',
    'Multi-engine experience',
    'Valid Second Class Medical Certificate',
    'Instrument rating'
  ],
  preferred_qualifications = ARRAY[
    'Minimum 1,000 hours total time',
    'CFII certificate',
    'Technically advanced aircraft experience',
    'Bachelor''s degree',
    'Customer service experience'
  ],
  inside_scoop = ARRAY[
    '7 on/7 off schedule options',
    'Largest civilian PC-12 operator',
    'Growing PC-24 fleet',
    'Excellent work-life balance',
    'Home every week'
  ],
  additional_info = ARRAY[
    'Founded in 1995',
    'Based in Portsmouth, New Hampshire',
    'Fractional ownership model',
    'Focus on turboprop operations',
    'Strong New England presence'
  ]
WHERE name = 'PlaneSense';

-- Update Wheels Up  
UPDATE airlines SET
  call_sign = 'Wheels Up',
  pilot_group_size = '1,200+',
  fleet_size = 180,
  description = 'Atlanta-based private aviation company offering membership-based flying solutions with diverse fleet from turboprops to heavy jets.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://wheelsup.com/careers',
  most_junior_base = 'Atlanta (PDK)',
  most_junior_captain_hire_date = 'February 2021',
  retirements_in_2025 = 35,
  fo_pay_year_1 = '$70,000-$98,500 (aircraft dependent)',
  fo_pay_year_5 = '$76,000-$108,500',
  fo_pay_year_10 = '$81,500-$123,500',
  captain_pay_year_1 = '$96,000-$118,500 (aircraft dependent)',
  captain_pay_year_5 = '$107,000-$133,500',
  captain_pay_year_10 = '$112,000-$148,500',
  fleet_info = '[
    {"type": "King Air 350i", "quantity": 45},
    {"type": "Citation CJ3+", "quantity": 35},
    {"type": "Citation Excel/XLS", "quantity": 40},
    {"type": "Hawker 400XP", "quantity": 25},
    {"type": "Super Mid and Heavy Jets", "quantity": 35}
  ]'::jsonb,
  bases = ARRAY['Atlanta (PDK)', 'Westchester (HPN)', 'Dallas (DAL)', 'Los Angeles (VNY)', 'Miami (OPF)'],
  required_qualifications = ARRAY[
    'ATP certificate (for Captain)',
    'Commercial Multi-Engine (for First Officer)',
    'Minimum 3,500 hours total (Captain) / 1,200 hours (FO)',
    'PIC Type Rating (Captain) / SIC Type Rating (FO)',
    'First Class Medical Certificate'
  ],
  preferred_qualifications = ARRAY[
    'Previous Part 135 experience',
    'Type ratings in fleet aircraft',
    'Bachelor''s degree',
    'Strong customer service skills',
    'Professional appearance'
  ],
  inside_scoop = ARRAY[
    '8 on/6 off schedule',
    'Multiple aircraft categories',
    'Growing fleet and operations',
    'Membership-based business model',
    'Diverse flying opportunities'
  ],
  additional_info = ARRAY[
    'Founded in 2013',
    'Based in Atlanta, Georgia',
    'Publicly traded company',
    'Focus on membership programs',
    'Nationwide operations'
  ]
WHERE name = 'Wheels Up';

-- Update Flight Options
UPDATE airlines SET
  call_sign = 'Options',
  pilot_group_size = '1,800+',
  fleet_size = 200,
  description = 'Large fractional ownership program offering access to diverse fleet of business aircraft. Part of Directional Aviation group with nationwide operations.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://www.flightoptions.com/careers',
  most_junior_base = 'Cleveland (CLE)',
  most_junior_captain_hire_date = 'May 2020',
  retirements_in_2025 = 65,
  fo_pay_year_1 = '$75,000',
  fo_pay_year_5 = '$90,000',
  fo_pay_year_10 = '$105,000',
  captain_pay_year_1 = '$130,000',
  captain_pay_year_5 = '$155,000',
  captain_pay_year_10 = '$180,000',
  fleet_info = '[
    {"type": "Citation CJ2/CJ3", "quantity": 45},
    {"type": "Citation Excel/XLS", "quantity": 55},
    {"type": "Hawker 800/900", "quantity": 35},
    {"type": "Challenger 300/350", "quantity": 40},
    {"type": "Gulfstream G200/G280", "quantity": 25}
  ]'::jsonb,
  bases = ARRAY['Cleveland (CLE)', 'Chicago (PWK)', 'Dallas (ADS)', 'Atlanta (PDK)', 'Teterboro (TEB)'],
  required_qualifications = ARRAY[
    'ATP certificate or meet ATP requirements',
    'Minimum 1,500 hours total flight time',
    'Multi-engine rating',
    'Valid First Class Medical Certificate',
    'Valid passport'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous turbine or jet experience',
    'Type ratings in fractional aircraft',
    'Strong interpersonal skills',
    'Professional demeanor'
  ],
  inside_scoop = ARRAY[
    'Part of Directional Aviation family',
    'Flexible scheduling options',
    'Diverse fleet operations',
    'Strong safety culture',
    'Career advancement opportunities'
  ],
  additional_info = ARRAY[
    'Established fractional operator',
    'Nationwide service area',
    'Focus on customer service',
    'Multiple aircraft categories',
    'Professional pilot development'
  ]
WHERE name = 'Flight Options';