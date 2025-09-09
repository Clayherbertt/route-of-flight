-- Update comprehensive cargo airline data for 2025

-- Update FedEx Express
UPDATE airlines SET 
  logo = '📦',
  call_sign = 'FedEx',
  pilot_group_size = '5,400+',
  description = 'The world''s largest express transportation company and cargo airline, operating one of the largest fleets of all-cargo aircraft. FedEx Express provides time-definite delivery to more than 220 countries and territories.',
  pilot_union = 'ALPA (Air Line Pilots Association)',
  fleet_size = 650,
  fleet_info = '[
    {"aircraft": "Boeing 777F", "count": 50, "notes": "Long-haul freighter"},
    {"aircraft": "Boeing 767F", "count": 120, "notes": "Medium-haul cargo"},
    {"aircraft": "Airbus A300-600F", "count": 70, "notes": "Being retired"},
    {"aircraft": "Boeing MD-10", "count": 55, "notes": "Being retired"},
    {"aircraft": "Boeing MD-11F", "count": 57, "notes": "Long-haul cargo"},
    {"aircraft": "ATR 42/72F", "count": 50, "notes": "Feeder operations"},
    {"aircraft": "Cessna 208", "count": 248, "notes": "Small package delivery"}
  ]'::jsonb,
  is_hiring = true,
  retirements_in_2025 = 85,
  bases = ARRAY['Memphis (MEM) - Primary Hub', 'Indianapolis (IND)', 'Newark (EWR)', 'Oakland (OAK)', 'Miami (MIA)', 'Anchorage (ANC)', 'Cologne (CGN)', 'Guangzhou (CAN)', 'Paris (CDG)'],
  fo_pay_year_1 = '$89/hour',
  fo_pay_year_5 = '$145/hour',
  fo_pay_year_10 = '$195/hour',
  captain_pay_year_1 = '$165/hour',
  captain_pay_year_5 = '$220/hour',
  captain_pay_year_10 = '$290/hour',
  required_qualifications = ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '250 Multi-Engine Time', 'Clean MVR and Background'],
  preferred_qualifications = ARRAY['College Degree Preferred', '2,500+ Total Time', '1,000+ Turbine Time', 'International Experience', 'Previous Cargo Experience'],
  inside_scoop = ARRAY['Excellent benefits and profit sharing', 'Strong job security in cargo market', 'Rapid advancement opportunities', 'Global flying to 220+ countries', 'Industry-leading retirement benefits'],
  additional_info = ARRAY['One of the highest paying cargo carriers', 'Strong culture of safety and professionalism', 'Significant international flying opportunities', 'Cargo operations less affected by economic downturns', 'Memphis hub offers lower cost of living'],
  most_junior_base = 'Indianapolis (IND)',
  most_junior_captain_hire_date = 'January 2019'
WHERE name = 'FedEx Express';

-- Update Atlas Air
UPDATE airlines SET 
  logo = '🌐',
  call_sign = 'Giant',
  pilot_group_size = '2,200+',
  description = 'A leading provider of outsourced aircraft and aviation operating services. Atlas Air operates cargo and passenger aircraft for airlines, freight forwarders, and the military under the Air Mobility Command.',
  pilot_union = 'Teamsters Local 1224',
  fleet_size = 100,
  fleet_info = '[
    {"aircraft": "Boeing 747-400F", "count": 32, "notes": "Long-haul cargo"},
    {"aircraft": "Boeing 747-8F", "count": 18, "notes": "Latest freighter"},
    {"aircraft": "Boeing 767-300F", "count": 28, "notes": "Medium-haul cargo"},
    {"aircraft": "Boeing 777F", "count": 12, "notes": "Long-haul premium"},
    {"aircraft": "Boeing 747-400", "count": 10, "notes": "Passenger charter"}
  ]'::jsonb,
  is_hiring = true,
  retirements_in_2025 = 15,
  bases = ARRAY['Purchase (PUR/JFK)', 'Miami (MIA)', 'Cincinnati (CVG)', 'Anchorage (ANC)', 'Toledo (TOL)'],
  fo_pay_year_1 = '$78/hour',
  fo_pay_year_5 = '$125/hour',
  fo_pay_year_10 = '$165/hour',
  captain_pay_year_1 = '$145/hour',
  captain_pay_year_5 = '$190/hour',
  captain_pay_year_10 = '$245/hour',
  required_qualifications = ARRAY['ATP Certificate', 'First Class Medical', '1,500 Total Flight Time', '500 Multi-Engine Time', 'Clean Background and MVR'],
  preferred_qualifications = ARRAY['College Degree Preferred', '2,500+ Total Time', '1,000+ Turbine Time', 'International Experience', 'Heavy Aircraft Experience'],
  inside_scoop = ARRAY['Diverse flying: cargo, passenger, military', 'International heavy aircraft experience', 'Contract flying for major carriers', 'Growing military business', 'Competitive benefits package'],
  additional_info = ARRAY['Flies for Amazon Prime Air', 'Military contract work (AMC)', 'Wet lease operations for airlines', 'New York area based', 'Rapid growth opportunities'],
  most_junior_base = 'Purchase (PUR)',
  most_junior_captain_hire_date = 'June 2018'
WHERE name = 'Atlas Air';