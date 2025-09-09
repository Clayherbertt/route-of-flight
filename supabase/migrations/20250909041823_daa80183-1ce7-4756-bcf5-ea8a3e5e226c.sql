-- Update NetJets with comprehensive data
UPDATE airlines SET
  call_sign = 'Execjet',
  pilot_group_size = '2,779+',
  fleet_size = 750,
  description = 'Columbus, Ohio-based fractional ownership company, largest in the world. Part of Berkshire Hathaway. Operates diverse fleet of business jets from light to ultra-long range aircraft.',
  pilot_union = 'NJASAP (NetJets Association of Shared Aircraft Pilots)',
  is_hiring = true,
  application_url = 'https://netjets.com/careers',
  most_junior_base = 'Home-based (224 options)',
  most_junior_captain_hire_date = 'August 2008',
  retirements_in_2025 = 180,
  fo_pay_year_1 = '$85,000-$95,000 (schedule dependent)',
  fo_pay_year_5 = '$105,000-$115,000',
  fo_pay_year_10 = '$125,000-$140,000',
  captain_pay_year_1 = '$115,000-$150,000 (schedule/aircraft dependent)',
  captain_pay_year_5 = '$140,000-$180,000',
  captain_pay_year_10 = '$175,000-$220,000',
  fleet_info = '[
    {"type": "Citation XLS", "quantity": 85},
    {"type": "Citation Sovereign", "quantity": 75},
    {"type": "Citation Latitude", "quantity": 95},
    {"type": "Citation Longitude", "quantity": 65},
    {"type": "Phenom 300", "quantity": 120},
    {"type": "Challenger 350", "quantity": 90},
    {"type": "Challenger 650", "quantity": 45},
    {"type": "Global 5000/5500", "quantity": 55},
    {"type": "Global 6000", "quantity": 35},
    {"type": "Global 7500", "quantity": 85}
  ]'::jsonb,
  bases = ARRAY['Home-based from 224 locations nationwide'],
  required_qualifications = ARRAY[
    'FAA ATP, Restricted ATP, or meet ATP requirements',
    'Minimum 21 years of age',
    '1,500 hours total flight time (or R-ATP minimums)',
    'Multi-engine rating',
    'Valid First Class Medical Certificate',
    'Valid passport'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous turbine or jet experience',
    'Type ratings in NetJets aircraft',
    'Strong customer service skills',
    'Professional appearance and demeanor'
  ],
  inside_scoop = ARRAY[
    'Home-based system - no commuting',
    '100% company-paid medical for pilot and family',
    'All type ratings paid by company',
    'Multiple schedule options (7/7, 8/6, crew choice)',
    'Warren Buffett''s Berkshire Hathaway ownership'
  ],
  additional_info = ARRAY[
    'Founded in 1964',
    'World''s largest fractional operator',
    'Fleet upgrade program with new aircraft',
    'Multiple subsidiary companies',
    'Strong safety culture and record'
  ]
WHERE name = 'NetJets';

-- Update Flexjet with comprehensive data
UPDATE airlines SET
  call_sign = 'FlexJet',
  pilot_group_size = '1,800+',
  fleet_size = 262,
  description = 'Cleveland, Ohio-based fractional ownership company offering diverse fleet of business jets. Known for excellent pilot quality of life and competitive compensation packages.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://careers.flexjet.com/',
  most_junior_base = 'Home-based (80 options)',
  most_junior_captain_hire_date = 'December 2020',
  retirements_in_2025 = 85,
  fo_pay_year_1 = '$100,000 (guaranteed minimum)',
  fo_pay_year_5 = '$125,000',
  fo_pay_year_10 = '$140,000',
  captain_pay_year_1 = '$140,000-$160,000 (aircraft dependent)',
  captain_pay_year_5 = '$175,000-$195,000',
  captain_pay_year_10 = '$200,000-$250,000',
  fleet_info = '[
    {"type": "Phenom 300", "quantity": 60},
    {"type": "Challenger 300", "quantity": 31},
    {"type": "Challenger 350", "quantity": 31},
    {"type": "Challenger 3500", "quantity": 31},
    {"type": "Embraer Legacy 450/500", "quantity": 27},
    {"type": "Global Express", "quantity": 4},
    {"type": "Gulfstream G450", "quantity": 30},
    {"type": "Gulfstream G650", "quantity": 18}
  ]'::jsonb,
  bases = ARRAY['Home-based from 80 locations nationwide'],
  required_qualifications = ARRAY[
    'Meet ATP minimums (written complete)',
    'Minimum 3,000 hours total flight time',
    'Current First Class Medical Certificate',
    'Valid passport',
    'Ability to obtain CANPASS permit'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree in Aviation or related field',
    'Previous Part 135/91K or corporate experience',
    'Type ratings in Flexjet aircraft',
    'Quality flight time (military, PIC, turbine)',
    'Strong communication skills'
  ],
  inside_scoop = ARRAY[
    'First Officer starting pay $100,000',
    'Guaranteed Captain upgrade in 5 years or less',
    'No commuting - company pays all travel costs',
    'Performance and productivity bonuses available',
    '20% growth forecasted'
  ],
  additional_info = ARRAY[
    'Founded in 1995',
    'Based in Cleveland, Ohio',
    'No training contracts',
    'All meals covered plus per diem',
    'Designer uniforms and KCM provided'
  ]
WHERE name = 'Flexjet';

-- Update Airshare with comprehensive data
UPDATE airlines SET
  call_sign = 'Airshare',
  pilot_group_size = '250+',
  fleet_size = 40,
  description = 'Kansas-based fractional aircraft ownership company specializing in Phenom 100/300 aircraft. Focus on regional operations with excellent work-life balance.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://careers.flyairshare.com/',
  most_junior_base = 'Kansas City (MCI)',
  most_junior_captain_hire_date = 'March 2021',
  retirements_in_2025 = 8,
  fo_pay_year_1 = '$80,000',
  fo_pay_year_5 = '$95,000',
  fo_pay_year_10 = '$110,000',
  captain_pay_year_1 = '$120,000',
  captain_pay_year_5 = '$140,000',
  captain_pay_year_10 = '$160,000',
  fleet_info = '[
    {"type": "Embraer Phenom 100", "quantity": 20},
    {"type": "Embraer Phenom 300", "quantity": 20}
  ]'::jsonb,
  bases = ARRAY['Kansas City (MCI)', 'Wichita (ICT)', 'Dallas (DAL)', 'Oklahoma City (OKC)'],
  required_qualifications = ARRAY[
    'Commercial multi-engine certificate',
    'Minimum 1,200 hours total flight time',
    'Multi-engine experience',
    'Valid Second Class Medical Certificate',
    'Instrument rating'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous turbine experience',
    'Phenom type rating',
    'Part 135 experience',
    'Customer service background'
  ],
  inside_scoop = ARRAY[
    'First year Phenom Captains earn up to $160,000',
    'Excellent quality of life',
    'Stable work schedule',
    'Regional focus allows more home time',
    'Growing fleet and operations'
  ],
  additional_info = ARRAY[
    'Founded in 2000',
    'Based in Kansas',
    'Focus on regional fractional ownership',
    'Strong customer service culture',
    'Flexible scheduling options'
  ]
WHERE name = 'Airshare';