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