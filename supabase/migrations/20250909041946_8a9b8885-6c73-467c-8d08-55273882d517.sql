-- Update Wheels Up with comprehensive data
UPDATE airlines SET
  call_sign = 'Wheels Up',
  pilot_group_size = '1,200+',
  fleet_size = 180,
  description = 'Chamblee, Georgia-based private aviation company offering membership-based flying solutions. Operates diverse fleet from turboprops to heavy jets.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://wheelsup.com/pilots',
  most_junior_base = 'Atlanta (PDK)',
  most_junior_captain_hire_date = 'January 2022',
  retirements_in_2025 = 35,
  fo_pay_year_1 = '$70,000-$98,500 (aircraft dependent)',
  fo_pay_year_5 = '$79,000-$123,500',
  fo_pay_year_10 = '$81,500-$128,500',
  captain_pay_year_1 = '$96,000-$118,500 (aircraft dependent)',
  captain_pay_year_5 = '$107,000-$148,500',
  captain_pay_year_10 = '$112,000-$158,500',
  fleet_info = '[
    {"type": "King Air 350i", "quantity": 45},
    {"type": "Citation CJ3+", "quantity": 35},
    {"type": "Citation XLS+", "quantity": 30},
    {"type": "Hawker 400XP", "quantity": 25},
    {"type": "Citation X", "quantity": 20},
    {"type": "Global Express", "quantity": 15},
    {"type": "Challenger 300", "quantity": 10}
  ]'::jsonb,
  bases = ARRAY['Atlanta (PDK)', 'Westchester (HPN)', 'Dallas (DAL)', 'West Palm Beach (LNA)', 'Los Angeles (VNY)', 'Denver (BJC)'],
  required_qualifications = ARRAY[
    'Commercial certificate with instrument rating',
    'Minimum 1,500 hours total flight time',
    'Multi-engine land experience',
    'Valid First or Second Class Medical',
    'Clean background check'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous Part 135 experience',
    'Type ratings in Wheels Up aircraft',
    'Turbine experience',
    'Customer service oriented'
  ],
  inside_scoop = ARRAY[
    'Aircrew 360 pay scales based on aircraft type',
    '8 on / 6 off primary schedule',
    'Established in 1984',
    'Longest continuous ARG/US Platinum rating',
    'Lifestyle flying - different destinations daily'
  ],
  additional_info = ARRAY[
    'Founded in 1984',
    'Based in Chamblee, Georgia',
    'Membership-based private aviation',
    'Diverse fleet and destinations',
    'Strong safety record'
  ]
WHERE name = 'Wheels Up';