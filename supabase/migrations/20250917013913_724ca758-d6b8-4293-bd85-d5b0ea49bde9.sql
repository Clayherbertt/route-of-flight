-- Update American Airlines with captain narrowbody and widebody pay scales
UPDATE airlines 
SET 
  captain_narrowbody_pay_year_1 = '$309.03/hr',
  captain_narrowbody_pay_year_2 = '$311.46/hr', 
  captain_narrowbody_pay_year_3 = '$313.90/hr',
  captain_narrowbody_pay_year_4 = '$316.45/hr',
  captain_narrowbody_pay_year_5 = '$319.02/hr',
  captain_narrowbody_pay_year_6 = '$321.57/hr',
  captain_narrowbody_pay_year_7 = '$324.10/hr',
  captain_narrowbody_pay_year_8 = '$326.64/hr',
  captain_narrowbody_pay_year_9 = '$329.24/hr',
  captain_narrowbody_pay_year_10 = '$331.69/hr',
  captain_widebody_pay_year_1 = '$383.12/hr',
  captain_widebody_pay_year_2 = '$386.23/hr',
  captain_widebody_pay_year_3 = '$389.39/hr',
  captain_widebody_pay_year_4 = '$392.52/hr',
  captain_widebody_pay_year_5 = '$395.68/hr',
  captain_widebody_pay_year_6 = '$398.78/hr',
  captain_widebody_pay_year_7 = '$401.92/hr',
  captain_widebody_pay_year_8 = '$405.02/hr',
  captain_widebody_pay_year_9 = '$408.16/hr',
  captain_widebody_pay_year_10 = '$411.28/hr',
  updated_at = now()
WHERE name = 'American Airlines';