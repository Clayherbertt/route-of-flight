-- Update PlaneSense with comprehensive data
UPDATE airlines SET
  call_sign = 'PlaneSense',
  pilot_group_size = '300+',
  fleet_size = 45,
  description = 'Portsmouth, New Hampshire-based fractional ownership program specializing exclusively in Pilatus PC-12 turboprop aircraft. Known for single-pilot operations.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://www.planesense.com/careers',
  most_junior_base = 'Portsmouth (PSM)',
  most_junior_captain_hire_date = 'June 2020',
  retirements_in_2025 = 12,
  fo_pay_year_1 = '$65,000',
  fo_pay_year_5 = '$75,000',
  fo_pay_year_10 = '$85,000',
  captain_pay_year_1 = '$95,000',
  captain_pay_year_5 = '$115,000',
  captain_pay_year_10 = '$135,000',
  fleet_info = '[
    {"type": "Pilatus PC-12", "quantity": 45}
  ]'::jsonb,
  bases = ARRAY['Portsmouth (PSM)', 'Boston (BOS)', 'Hartford (BDL)', 'White Plains (HPN)'],
  required_qualifications = ARRAY[
    'Commercial certificate minimum',
    'Minimum 750 hours total flight time',
    'Multi-engine land experience',
    'Valid Second Class Medical Certificate',
    'Instrument rating'
  ],
  preferred_qualifications = ARRAY[
    'Minimum 1,000 hours total time',
    'Experience in technically advanced aircraft',
    'CFII rating',
    'Turboprop experience',
    'Customer service skills'
  ],
  inside_scoop = ARRAY[
    'Single-pilot operations in PC-12',
    'Lower minimums than most fractionals',
    'New England focus',
    'Excellent training program',
    'Strong company culture'
  ],
  additional_info = ARRAY[
    'Founded in 1995',
    'Based in Portsmouth, New Hampshire',
    'Exclusive Pilatus PC-12 operator',
    'Focus on New England region',
    'Known for operational reliability'
  ]
WHERE name = 'PlaneSense';