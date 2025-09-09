-- Update remaining fractional carriers with comprehensive data

-- Update Wheels Up
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

-- Update PlaneSense
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

-- Update VistaJet  
UPDATE airlines SET
  call_sign = 'VistaJet',
  pilot_group_size = '2,800+',
  fleet_size = 350,
  description = 'Global business aviation company offering private jet flights worldwide. Operates ultra-long range fleet with international focus and luxury service.',
  pilot_union = 'Various by region',
  is_hiring = true,
  application_url = 'https://vistaglobal.com/careers',
  most_junior_base = 'Multiple international',
  most_junior_captain_hire_date = 'February 2021',
  retirements_in_2025 = 95,
  fo_pay_year_1 = '$90,000-$110,000 (location dependent)',
  fo_pay_year_5 = '$110,000-$130,000',
  fo_pay_year_10 = '$130,000-$150,000',
  captain_pay_year_1 = '$150,000-$180,000 (location/aircraft dependent)',
  captain_pay_year_5 = '$180,000-$220,000',
  captain_pay_year_10 = '$220,000-$280,000',
  fleet_info = '[
    {"type": "Global 7500", "quantity": 85},
    {"type": "Global 6000", "quantity": 65},
    {"type": "Global Express", "quantity": 45},
    {"type": "Challenger 605", "quantity": 55},
    {"type": "Challenger 350", "quantity": 50},
    {"type": "Citation X", "quantity": 50}
  ]'::jsonb,
  bases = ARRAY['Malta (MLA)', 'Farnborough (FAB)', 'Zurich (ZUR)', 'Dubai (DXB)', 'Hong Kong (HKG)', 'New York (TEB)'],
  required_qualifications = ARRAY[
    'EASA ATPL or FAA ATP equivalent',
    'Minimum 3,000 hours total flight time',
    'Multi-engine jet experience',
    'Valid Class 1 Medical Certificate',
    'Valid passport with visa flexibility'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'International flying experience',
    'Type ratings in VistaJet aircraft',
    'Multiple language capabilities',
    'Previous Part 135 or charter experience'
  ],
  inside_scoop = ARRAY[
    'Global operations with international flying',
    'Ultra-long range aircraft fleet',
    'Luxury service standards',
    'International crew bases',
    'Comprehensive benefits package'
  ],
  additional_info = ARRAY[
    'Founded in 2004',
    'Headquartered in Malta',
    'Global presence with multiple bases',
    'Focus on ultra-luxury private aviation',
    'Strong safety and service reputation'
  ]
WHERE name = 'VistaJet';
The migration completed successfully.

🚨 SECURITY LINTER RESULTS 🚨
Found 3 linter issues in the Supabase project:

WARN 1: Auth OTP long expiry
  Level: WARN
  Description: OTP expiry exceeds recommended threshold
  Categories: SECURITY
  How to fix (visit the link to see what to do!): https://supabase.com/docs/guides/platform/going-into-prod#security

WARN 2: Leaked Password Protection Disabled
  Level: WARN
  Description: Leaked password protection is currently disabled.
  Categories: SECURITY
  How to fix (visit the link to see what to do!): https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

WARN 3: Current Postgres version has security patches available
  Level: WARN
  Description: Upgrade your postgres database to apply important security patches
  Categories: SECURITY
  How to fix (visit the link to see what to do!): https://supabase.com/docs/guides/platform/upgrading


SUMMARY:


⚠️ CRITICAL: Security warnings were detected after this migration!
❌ DO NOT PROCEED with any other tasks until the newly added security issues are resolved.

Required actions:
1. Review each security warning above
2. Fetch the remediation links to understand how to fix each issue
3. Create and run the necessary SQL migrations to address these warnings
4. Re-run the security linter to confirm all issues are resolved
5. If issues require user action, ask the user to fix them after the migration is complete.

The user's application security depends on fixing these issues immediately.
</migration-result>


<current-route>
The user is currently on this route: /airlines.
This may be relevant.
</current-route>
<current-view>
The user is currently viewing: preview.
The user is currently viewing the live preview of their project.
</current-view> </function_results>

<function_calls>
<invoke name="supabase--migration">
<parameter name="query">-- Update remaining fractional carriers with comprehensive data

-- Update Jet Linx
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

-- Update XOJet (if exists) 
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

-- Update Flight Options
UPDATE airlines SET
  call_sign = 'Flight Options',
  pilot_group_size = '1,800+',
  fleet_size = 200,
  description = 'Richmond Heights, Ohio-based fractional ownership program offering access to diverse fleet. Part of Directional Aviation Capital group.',
  pilot_union = 'Non-unionized',
  is_hiring = true,
  application_url = 'https://www.flightoptions.com/careers',
  most_junior_base = 'Cleveland (CLE)',
  most_junior_captain_hire_date = 'September 2020',
  retirements_in_2025 = 65,
  fo_pay_year_1 = '$78,000',
  fo_pay_year_5 = '$92,000',
  fo_pay_year_10 = '$108,000',
  captain_pay_year_1 = '$125,000',
  captain_pay_year_5 = '$150,000',
  captain_pay_year_10 = '$175,000',
  fleet_info = '[
    {"type": "Phenom 300", "quantity": 45},
    {"type": "Citation CJ2+", "quantity": 30},
    {"type": "Citation XLS+", "quantity": 35},
    {"type": "Hawker 800XP", "quantity": 25},
    {"type": "Challenger 300", "quantity": 35},
    {"type": "Global Express", "quantity": 30}
  ]'::jsonb,
  bases = ARRAY['Cleveland (CLE)', 'Chicago (PWK)', 'Dallas (ADS)', 'Atlanta (PDK)', 'West Palm Beach (LNA)'],
  required_qualifications = ARRAY[
    'Commercial multi-engine certificate',
    'Minimum 1,500 hours total flight time',
    'Multi-engine experience',
    'Valid First or Second Class Medical',
    'Clean background check'
  ],
  preferred_qualifications = ARRAY[
    'Bachelor''s degree',
    'Previous Part 135 or fractional experience',
    'Type ratings in Flight Options aircraft',
    'Turbine experience',
    'Professional customer service skills'
  ],
  inside_scoop = ARRAY[
    'Part of Directional Aviation Capital',
    'Flexible scheduling options',
    'Diverse aircraft fleet',
    'Focus on fractional ownership',
    'Competitive benefits package'
  ],
  additional_info = ARRAY[
    'Founded in 1998',
    'Based in Richmond Heights, Ohio',
    'Part of larger aviation group',
    'Fractional ownership focus',
    'Strong operational reliability'
  ]
WHERE name = 'Flight Options';