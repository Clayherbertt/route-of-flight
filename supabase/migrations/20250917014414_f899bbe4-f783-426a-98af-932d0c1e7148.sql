-- Update American Airlines with First Officer pay data for narrowbody and widebody aircraft
UPDATE airlines 
SET 
  fo_narrowbody_pay_year_1 = '$108.34/hr',
  fo_narrowbody_pay_year_2 = '$166.60/hr',
  fo_narrowbody_pay_year_3 = '$194.95/hr',
  fo_narrowbody_pay_year_4 = '$199.67/hr',
  fo_narrowbody_pay_year_5 = '$204.47/hr',
  fo_narrowbody_pay_year_6 = '$209.67/hr',
  fo_narrowbody_pay_year_7 = '$215.54/hr',
  fo_narrowbody_pay_year_8 = '$220.51/hr',
  fo_narrowbody_pay_year_9 = '$222.88/hr',
  fo_narrowbody_pay_year_10 = '$225.91/hr',
  fo_widebody_pay_year_1 = '$108.34/hr',
  fo_widebody_pay_year_2 = '$206.65/hr',
  fo_widebody_pay_year_3 = '$241.82/hr',
  fo_widebody_pay_year_4 = '$247.68/hr',
  fo_widebody_pay_year_5 = '$253.59/hr',
  fo_widebody_pay_year_6 = '$260.02/hr',
  fo_widebody_pay_year_7 = '$267.25/hr',
  fo_widebody_pay_year_8 = '$273.38/hr',
  fo_widebody_pay_year_9 = '$276.36/hr',
  fo_widebody_pay_year_10 = '$280.11/hr'
WHERE name = 'American Airlines';