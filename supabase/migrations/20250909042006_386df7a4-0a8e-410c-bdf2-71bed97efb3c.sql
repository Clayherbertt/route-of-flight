-- Update XOJet with comprehensive data
UPDATE airlines SET
  call_sign = 'XOJet',
  pilot_group_size = '600+',
  fleet_size = 90,
  description = 'Brisbane, California-based on-demand private jet charter and membership company. Known for technology-driven operations and West Coast focus.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://www.xojet.com/careers',
  most_junior_base = 'San Francisco (SJC)',
  most_junior_captain_hire_date = 'May 2020',
  retirements_in_2025 = 18,
  fo_pay_year_1 = '$85,000',
  fo_pay_year_5 = '$100,000',
  fo_pay_year_10 = '$115,000',
  captain_pay_year_1 = '$140,000',
  captain_pay_year_5 = '$165,000',
  captain_pay_year_10 = '$190,000',
  fleet_info = '[
    {"type": "Hawker 800XP", "quantity": 25},
    {"type": "Citation X", "quantity": 20},
    {"type": "Challenger 300", "quantity": 25},
    {"type": "Global Express", "quantity": 20}
  ]'::jsonb,
  bases = ARRAY['San Francisco (SJC)', 'Los Angeles (VNY)', 'Las Vegas (LAS)', 'Denver (APA)', 'Dallas (ADS)'],
  required_qualifications = ARRAY[
    'Commercial multi-engine certificate',
    'Minimum 2,000 hours total flight time',
    'Multi-engine turbine experience',
    'Valid First Class Medical Certificate',
    'Clean background and driving record'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous charter or fractional experience',
    'Type ratings in XOJet aircraft',
    'West Coast familiarity',
    'Technology-savvy approach'
  ],
  inside_scoop = ARRAY[
    'Technology-driven operations',
    'West Coast focus with premium service',
    'Competitive pay and benefits',
    'Growth opportunities',
    'Modern fleet and facilities'
  ],
  additional_info = ARRAY[
    'Founded in 2006',
    'Based in Brisbane, California',
    'Technology-focused private aviation',
    'Premium service standards',
    'Strong West Coast presence'
  ]
WHERE name = 'XOJet';