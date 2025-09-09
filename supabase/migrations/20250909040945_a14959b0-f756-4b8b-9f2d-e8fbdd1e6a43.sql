-- Update SkyWest Airlines with comprehensive data
UPDATE airlines SET
  call_sign = 'SkyWest',
  pilot_group_size = '4,800+',
  fleet_size = 485,
  description = 'St. George, Utah-based regional airline operating nearly 500 aircraft with partnerships with United, Delta, American, and Alaska Airlines. Known for excellent pilot quality of life.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://www.skywest.com/careers',
  most_junior_base = 'Salt Lake City (SLC)',
  most_junior_captain_hire_date = 'January 2023',
  retirements_in_2025 = 125,
  fo_pay_year_1 = '$90.00/hr',
  fo_pay_year_5 = '$102.00/hr',
  fo_pay_year_10 = '$112.00/hr',
  captain_pay_year_1 = '$150.00/hr',
  captain_pay_year_5 = '$175.00/hr',
  captain_pay_year_10 = '$195.00/hr',
  fleet_info = '[
    {"type": "CRJ-200", "quantity": 95},
    {"type": "CRJ-700", "quantity": 85},
    {"type": "CRJ-900", "quantity": 75},
    {"type": "Embraer 175", "quantity": 230}
  ]'::jsonb,
  bases = ARRAY['Salt Lake City (SLC)', 'Los Angeles (LAX)', 'San Francisco (SFO)', 'Denver (DEN)', 'Phoenix (PHX)', 'Chicago (ORD)', 'Minneapolis (MSP)', 'Detroit (DTW)', 'Atlanta (ATL)', 'Portland (PDX)', 'Seattle (SEA)', 'Houston (IAH)', 'Dallas (DFW)', 'St. George (SGU)', 'Fresno (FAT)', 'Palm Springs (PSP)', 'Bozeman (BZN)', 'Colorado Springs (COS)', 'Rapid City (RAP)', 'Billings (BIL)'],
  required_qualifications = ARRAY[
    'FAA ATP Certificate',
    'Minimum 1,500 hours total flight time',
    'Multi-engine land experience',
    'Valid First Class Medical Certificate',
    'FCC Restricted Radio Operators Permit'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous airline experience',
    'CRJ or ERJ type rating',
    'Clean MVR and criminal background',
    '23 years of age or older'
  ],
  inside_scoop = ARRAY[
    'Rapid upgrade times (12-18 months)',
    'Profit sharing and 401k match',
    '20 domiciles for lifestyle flexibility',
    'Four mainline partner airlines',
    'Excellent work-life balance'
  ],
  additional_info = ARRAY[
    'Founded in 1972',
    'Largest regional airline in the US',
    'Operates as United Express, Delta Connection, American Eagle, Alaska SkyWest',
    'Over 2,000 daily departures',
    'Strong safety culture and record'
  ]
WHERE name = 'SkyWest Airlines';