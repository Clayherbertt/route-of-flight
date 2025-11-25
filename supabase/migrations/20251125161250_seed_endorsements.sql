-- Insert or update FAA endorsements
-- Uses ON CONFLICT to update existing endorsements

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.1',
  'prerequisites',
  'PREREQUISITES FOR THE PRACTICAL TEST ENDORSEMENT',
  'Prerequisites for practical test: Title 14 of the Code of Federal Regulations (14 CFR) part 61, § 61.39(a)(6)(i) and (ii)',
  '§ 61.39(a)(6)(i) and (ii)',
  'I certify that [First name, MI, Last name] has received and logged training time within 2 calendar-months preceding the month of application in preparation for the practical test and [he or she] is prepared for the required practical test for the issuance of [applicable] certificate.',
  'Practical Test',
  false,
  NULL,
  NULL,
  1
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.2',
  'prerequisites',
  'PREREQUISITES FOR THE PRACTICAL TEST ENDORSEMENT',
  'Review of deficiencies identified on airman knowledge test: § 61.39(a)(6)(iii), as required',
  '§ 61.39(a)(6)(iii)',
  'I certify that [First name, MI, Last name] has demonstrated satisfactory knowledge of the subject areas in which [he or she] was deficient on the [applicable] airman knowledge test.',
  'Practical Test',
  false,
  NULL,
  NULL,
  2
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.3',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Pre-solo aeronautical knowledge: § 61.87(b)',
  '§ 61.87(b)',
  'I certify that [First name, MI, Last name] has satisfactorily completed the pre-solo knowledge test of § 61.87(b) for the [make and model] aircraft.',
  'Student Pilot',
  false,
  NULL,
  NULL,
  1
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.4',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Pre-solo flight training: § 61.87(c)(1) and (2)',
  '§ 61.87(c)(1) and (2)',
  'I certify that [First name, MI, Last name] has received and logged pre-solo flight training for the maneuvers and procedures that are appropriate to the [make and model] aircraft. I have determined [he or she] has demonstrated satisfactory proficiency and safety on the maneuvers and procedures required by § 61.87 in this or similar make and model of aircraft to be flown.',
  'Student Pilot',
  false,
  NULL,
  NULL,
  2
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.5',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Pre-solo flight training at night: § 61.87(o). Flight training must be received within the 90 calendar-day period preceding the date of the flight',
  '§ 61.87(o)',
  'I certify that [First name, MI, Last name] has received flight training at night on night flying procedures that include takeoffs, approaches, landings, and go-arounds at night at the [airport name] airport where the solo flight will be conducted; navigation training at night in the vicinity of the [airport name] airport where the solo flight will be conducted. This endorsement expires 90 calendar-days from the date the flight training at night was received.',
  'Student Pilot',
  true,
  90,
  NULL,
  3
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.6',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Solo flight (first 90 calendar-day period): § 61.87(n)',
  '§ 61.87(n)',
  'I certify that [First name, MI, Last name] has received the required training to qualify for solo flying. I have determined [he or she] meets the applicable requirements of § 61.87(n) and is proficient to make solo flights in [make and model].',
  'Student Pilot',
  true,
  90,
  NULL,
  4
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.7',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Solo flight (each additional 90 calendar-day period): § 61.87(p)',
  '§ 61.87(p)',
  'I certify that [First name, MI, Last name] has received the required training to qualify for solo flying. I have determined that [he or she] meets the applicable requirements of § 61.87(p) and is proficient to make solo flights in [make and model].',
  'Student Pilot',
  true,
  90,
  NULL,
  5
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.8',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Solo takeoffs and landings at another airport within 25 nautical miles (NM): § 61.93(b)(1)',
  '§ 61.93(b)(1)',
  'I certify that [First name, MI, Last name] has received the required training of § 61.93(b)(1). I have determined that [he or she] is proficient to practice solo takeoffs and landings at [airport name]. The takeoffs and landings at [airport name] are subject to the following conditions: [List any applicable conditions or limitations.]',
  'Student Pilot',
  false,
  NULL,
  NULL,
  6
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.9',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Solo cross-country flight: § 61.93(c)(1) and (2)',
  '§ 61.93(c)(1) and (2)',
  'I certify that [First name, MI, Last name] has received the required solo cross-country training. I find [he or she] has met the applicable requirements of § 61.93, and is proficient to make solo cross-country flights in a [make and model] aircraft, [aircraft category].',
  'Student Pilot',
  false,
  NULL,
  NULL,
  7
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.10',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Solo cross-country flight: § 61.93(c)(3)',
  '§ 61.93(c)(3)',
  'I have reviewed the cross-country planning of [First name, MI, Last name]. I find the planning and preparation to be correct to make the solo flight from [origination airport] to [origination airport] via [route of flight] with landings at [names of the airports] in a [make and model] aircraft on [date]. [List any applicable conditions or limitations.]',
  'Student Pilot',
  false,
  NULL,
  NULL,
  8
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.11',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Repeated solo cross-country flights not more than 50 NM from the point of departure: § 61.93(b)(2)',
  '§ 61.93(b)(2)',
  'I certify that [First name, MI, Last name] has received the required training in both directions between and at both [airport names]. I have determined that [he or she] is proficient of § 61.93(b)(2) to conduct repeated solo cross-country flights over that route, subject to the following conditions: [List any applicable conditions or limitations.]',
  'Student Pilot',
  false,
  NULL,
  NULL,
  9
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.12',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Solo flight in Class B airspace: § 61.95(a)',
  '§ 61.95(a)',
  'I certify that [First name, MI, Last name] has received the required training of § 61.95(a). I have determined [he or she] is proficient to conduct solo flights in [name of Class B] airspace. [List any applicable conditions or limitations.]',
  'Student Pilot',
  false,
  NULL,
  NULL,
  10
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.13',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Solo flight to, from, or at an airport located in Class B airspace: § 61.95(b) and 14 CFR part 91, § 91.131(b)(1)',
  '§ 61.95(b) and § 91.131(b)(1)',
  'I certify that [First name, MI, Last name] has received the required training of § 61.95(b)(1). I have determined that [he or she] is proficient to conduct solo flight operations at [name of airport]. [List any applicable conditions or limitations.]',
  'Student Pilot',
  false,
  NULL,
  NULL,
  11
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.14',
  'student-pilot',
  'STUDENT PILOT ENDORSEMENTS',
  'Endorsement of U.S. citizenship recommended by the Transportation Security Administration (TSA): Title 49 of the Code of Federal Regulations (49 CFR) § 1552.3(h)',
  '49 CFR § 1552.3(h)',
  'I certify that [First name, MI, Last name] has presented me a [type of document presented, such as a U.S. birth certificate or U.S. passport, and the relevant control or sequential number on the document, if any] establishing that [he or she] is a U.S. citizen or national in accordance with 49 CFR § 1552.3(h).',
  'Student Pilot',
  false,
  NULL,
  'The flight instructor must keep a copy of the documents used to provide proof of citizenship for 5 years or make the following endorsement in the student''s logbook and the instructor''s logbook or other record used to record flight student endorsements with the following:',
  12
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.15',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Solo flight in Class B, C, and D airspace: § 61.94(a)',
  '§ 61.94(a)',
  'I certify that [First name, MI, Last name] has received the required training of § 61.94(a). I have determined [he or she] is proficient to conduct solo flights in [name of Class B, C, or D] airspace and authorized to operate to, from through and at [name of airport]. [List any applicable conditions or limitations.]',
  'Student Pilot - Sport/Recreational',
  false,
  NULL,
  NULL,
  1
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.16',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Solo flight to, from, or at an airport located in Class B, C, or D airspace or at an airport having an operational control tower: § 61.94(b)',
  '§ 61.94(b)',
  'I certify that [First name, MI, Last name] has received the required training of § 61.94(b). I have determined that [he or she] is proficient to conduct solo flight operations at [name of airport]. [List any applicable conditions or limitations.]',
  'Student Pilot - Sport/Recreational',
  false,
  NULL,
  NULL,
  2
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.17',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Aeronautical knowledge test: §§ 61.35(a)(1) and 61.309.',
  '§ 61.309.',
  'I certify that [First name, MI, Last name] has received the required aeronautical knowledge training of § 61.309. I have determined that [he or she] is prepared for the [name of] knowledge test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  3
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.22',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Class B, C, or D airspace, at an airport located in Class B, C, or D airspace, or to,',
  '§ 61.325.',
  'I certify that [First name, MI, Last name] has received the required training of § 61.325. I have determined [he or she] is proficient to conduct operations in Class B, C, or D airspace, at an airport located in Class B, C, or D airspace, or to, from, through, or at an airport having an operational control tower.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  4
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.23',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Light-sport aircraft that has a maximum speed in level flight with maximum',
  '§ 61.327.',
  'I certify that [First name, MI, Last name] has received the required training required in accordance with § 61.327(a) in a [make and model] aircraft. I have determined [him or her] proficient to act as pilot in command of a light-sport aircraft that has a VH less than or equal to 87 KCAS.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  5
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.24',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Light-sport aircraft that has a VH greater than 87 KCAS: § 61.327.',
  '§ 61.327(b) in a',
  'I certify that [First name, MI, Last name] has received the required training required in accordance with § 61.327(b) in a [make and model] aircraft. I have determined [him or her] proficient to act as pilot in command of a light-sport aircraft that has a VH greater than 87 KCAS.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  6
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.25',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Aeronautical knowledge test: §§ 61.35(a)(1), 61.96(b)(3), and 61.97(b).',
  '§ 61.97(b).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.97(b). I have determined that [he or she] is prepared for the [name of] knowledge test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  7
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.26',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Flight proficiency/practical test: §§ 61.96(b)(5), 61.98(a) and (b), and 61.99. The',
  '§ 61.39 endorsements',
  'I certify that [First name, MI, Last name] has received the required training of §§ 61.98(b) and 61.99. I have determined that [he or she] is prepared for the [name of] practical test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  8
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.31',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Class B, C, or D airspace, at an airport located in Class B, C, or D airspace, or to,',
  '§ 61.101(d).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.101(d). I have determined [he or she] is proficient to conduct operations in Class B, C, or D airspace, at an airport located in Class B, C, or D airspace, or to, from, through, or at an airport having an operational control tower.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  9
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.32',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Aeronautical knowledge test: §§ 61.35(a)(1), 61.103(d), and 61.105.',
  '§ 61.105. I have determined',
  'I certify that [First name, MI, Last name] has received the required training in accordance with § 61.105. I have determined [he or she] is prepared for the [name of] knowledge test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  10
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.33',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Flight proficiency/practical test: §§ 61.103(f), 61.107(b), and 61.109. The endorsement',
  '§ 61.39 endorsements provided in',
  'I certify that [First name, MI, Last name] has received the required training in accordance with §§ 61.107 and 61.109. I have determined [he or she] is prepared for the [name of] practical test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  11
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.34',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Aeronautical knowledge test: §§ 61.35(a)(1), 61.123(c), and 61.125.',
  '§ 61.125.',
  'I certify that [First name, MI, Last name] has received the required training of § 61.125. I have determined that [he or she] is prepared for the [name of] knowledge test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  12
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.35',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Flight proficiency/practical test: §§ 61.123(e), 61.127, and 61.129. The endorsement',
  '§ 61.39 endorsements provided in',
  'I certify that [First name, MI, Last name] has received the required training of §§ 61.127 and 61.129. I have determined that [he or she] is prepared for the [name of] practical test. AIRLINE TRANSPORT PILOT (ATP) ENDORSEMENTS',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  13
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.38',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Aeronautical knowledge test: §§ 61.35(a)(1) and 61.65(a) and (b).',
  '§ 61.65(b).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.65(b). I have determined that [he or she] is prepared for the Instrument–[airplane, helicopter, or powered-lift] knowledge test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  14
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.39',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Flight proficiency/practical test: § 61.65(a)(6).',
  '§ 61.65(c)',
  'I certify that [First name, MI, Last name] has received the required training of § 61.65(c) and (d). I have determined [he or she] is prepared for the Instrument–[airplane, helicopter, or powered-lift] practical test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  15
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.41',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Fundamentals of instructing knowledge test: § 61.183(d).',
  '§ 61.185(a)(1).',
  'I certify that [First name, MI, Last name] has received the required fundamentals of instruction training of § 61.185(a)(1). I have determined that [he or she] is prepared for the Fundamentals of Instructing knowledge test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  16
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.45',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Spin training: § 61.183(i)(1). The spin training endorsement is only required of flight',
  '§ 61.183(i)',
  'I certify that [First name, MI, Last name] has received the required training of § 61.183(i) in [an airplane, a glider]. I have determined that [he or she] is competent and possesses instructional proficiency in stall awareness, spin entry, spins, and spin recovery procedures.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  17
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.47',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Fundamentals of instructing knowledge test: § 61.405(a)(1).',
  '§ 61.405(a)(1).',
  'I certify that [First name, MI, Last name] has received the required training in accordance with § 61.405(a)(1). I have determined that [he or she] is prepared for the Fundamentals of Instructing Knowledge Test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  18
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.54',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Spin training: § 61.405(b)(1)(ii). This spin training endorsement is only required for',
  '§ 61.405(b)(1)(ii).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.405(b)(1)(ii). I have determined that [he or she] is competent and possesses instructional proficiency in stall awareness, spin entry, spins, and spin recovery procedures.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  19
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.55',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Ground instructor who does not meet the recent experience requirements:',
  '§ 61.217(d). This endorsement is issued by an authorized instructor (ground or flight) as',
  'I certify that [First name, MI, Last name] has demonstrated knowledge in the subject areas prescribed for a (basic, advanced, instrument) ground instructor under § 61.213(a)(3) and (a)(4), as appropriate. SPECIAL FEDERAL AVIATION REGULATION (SFAR) 73, ROBINSON R-22/R-44 SPECIAL TRAINING AND EXPERIENCE REQUIREMENTS, ENDORSEMENTS',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  20
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.66',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Completion of any phase of an FAA-sponsored Pilot Proficiency Program',
  '§ 61.56(e).',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has satisfactorily completed Level: [Basic/Advanced/Master, as appropriate], PHASE NO. [..] OF A WINGS PROGRAM ON [DATE].',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  21
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.72',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'To act as pilot in command of an aircraft in solo operations when the pilot does not',
  '§ 61.31(d)(2).',
  'I certify that [First name, MI, Last name] has received the training as required by § 61.31(d)(2) to serve as a pilot in command in a [specific category and class] of aircraft. I have determined that [he or she] is prepared to solo that [make and model] aircraft. Limitations: [optional].',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  22
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.73',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Retesting after failure of a knowledge or practical test: § 61.49. In the case of a failed',
  '§ 61.49.',
  'I certify that [First name, MI, Last name] has received the additional [flight and/or ground, as appropriate] training as required by § 61.49. I have determined that [he or she] is proficient to pass the [name of] knowledge/practical test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  23
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.79',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Launch procedures for operating a glider: § 61.31(j).',
  '§ 61.31(j).',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training in a glider [make and model] for [ground-tow, aerotow, self-launch] procedure. I have determined that [he or she] is proficient in [ground-tow, aerotow, self-launch] procedure.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  24
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.80',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Glider and unpowered ultralight vehicle towing experience: § 61.69(a)(5). This',
  '§ 61.69(c) and (d) and who',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has accomplished at least three flights in an aircraft while towing [a glider or unpowered ultralight vehicle, or while simulating towing flight procedures, as applicable]. /s/ [date] J. J. Jones 987654321',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  25
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.81',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Glider and unpowered ultralight vehicle towing ground and flight: § 61.69(a)(3).',
  '§ 61.69(a)(3).',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required ground and flight training in [a glider or unpowered ultralight vehicle, as applicable]. I have determined that [he or she] is proficient in the techniques and procedures essential to the safe towing of [gliders or unpowered vehicles, as applicable] including airspeed limitations; emergency procedures; signals used; and maximum angles of bank.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  26
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.82',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Review of a home study curriculum: § 61.35(a)(1).',
  '§ 61.35(a)(1).',
  'I certify I have reviewed the home study curriculum of [First name, MI, Last name]. I have determined that [he or she] is prepared for the [name of] knowledge test. Note: This endorsement cannot be used for the ATP Airplane Multiengine Knowledge Test.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  27
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.83',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Experimental aircraft only—additional aircraft category or class rating (other than',
  '§ 61.63(h).',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], as required by § 61.63(h), is proficient to act as pilot in command in a [category, class, make, and model] of experimental aircraft and has logged at least 5 hours flight time logged between September 1, 2004, and August 31, 2005, while acting as pilot in command in [aircraft category/class rating and make and model] that has been issued an experimental certificate.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  28
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.85',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Aeronautical experience credit—ultralight vehicles: § 61.52.',
  '§ 61.52(c).',
  'I certify that I have reviewed the records of [First name, MI, Last name], as required by § 61.52(c). I have determined that [he or she] may use [number of hours] aeronautical experience obtained in an ultralight vehicle to meet the requirements for [certificate/rating/privilege]. NIGHT VISION GOGGLES (NVG) OPERATIONS',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  29
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.86',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Endorsement required for ground training to act as pilot in command of an aircraft',
  '§ 61.31(k)(1). This training and endorsement must be given by an',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the ground training required by § 61.31(k)(1), (i) through (v) to conduct night vision goggle operations.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  30
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.87',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Endorsement required for flight training and statement of proficiency to act as pilot',
  '§ 61.31(k)(2). This training and endorsement',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the flight training on night vision goggle operations required by 14 CFR § 61.31(k)(2), (i) through (iv). I find [he or she] proficient in the use of night vision goggles.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  31
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.88',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Endorsement required to provide training for NVG operations: § 61.195(k)(7).',
  '§ 61.195(k) and is authorized to perform',
  'I certify that [First name, MI, Last name], holder of CFI Certificate No. [ ], meets the night vision goggle instructor requirements of § 61.195(k) and is authorized to perform the night vision goggle pilot-in-command qualification and recent flight experience requirements under §§ 61.31(k) and 61.57(f) and (g). This endorsement does not provide the authority to endorse another flight instructor as a night vision goggle instructor. /s/ [date] I. M. Inspector 987654321CFI Exp. 12-31-19 Position ENHANCED FLIGHT VISION SYSTEM (EFVS)',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  32
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.89',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Endorsement for EFVS ground training: § 61.66(a).',
  '§ 61.66(a) appropriate to the',
  'I certify that [First name, MI, Last name], [pilot certificate], [certificate number], has satisfactorily completed the ground training required by § 61.66(a) appropriate to the [appropriate aircraft category] category of aircraft.',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  33
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.90',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Endorsement for EFVS flight training: § 61.66(b).',
  '§ 61.66(b) and is proficient in the use of EFVS in',
  'I certify that [First name, MI, Last name], [pilot certificate], [certificate number], has received the flight training required by § 61.66(b) and is proficient in the use of EFVS in the [appropriate aircraft category in which the flight training was conducted] category of aircraft for EFVS operations conducted under [§ 91.176(a), (b), or both § 91.176(a) and (b)].',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  34
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.91',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Endorsement for EFVS ground and flight training: § 61.66(a) and (b).',
  '§ 61.66(a) and has received the',
  'I certify that [First name, MI, Last name], [pilot certificate], [certificate number], has satisfactorily completed the ground training required by § 61.66(a) and has received the flight training required by § 61.66(b) for EFVS operations and is proficient in the use of EFVS in the [appropriate aircraft category in which the ground and flight training was conducted] category of aircraft for EFVS operations conducted under [§ 91.176(a), (b), or both § 91.176(a) and (b)].',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  35
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.92',
  'additional-student-pilot',
  'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
  'Endorsement for EFVS supplementary training: § 61.66(c).',
  '§ 61.66(c) for',
  'I certify that [First name, MI, Last name], [pilot certificate], [certificate number], has satisfactorily completed the required ground and flight training required by § 61.66(c) for EFVS operations and is proficient in the use of EFVS in the [the appropriate aircraft category in which the supplementary ground and flight training was conducted] category of aircraft for EFVS operations conducted under [§ 91.176(a), (b), or both § 91.176(a) and (b)].',
  'Additional Endorsements',
  false,
  NULL,
  NULL,
  36
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.18',
  'currency-proficiency',
  'CURRENCY AND PROFICIENCY',
  'Taking flight proficiency check for different category or class of aircraft: §§ 61.309',
  '§ 61.309 and 61.311 and have determined that',
  'I certify that [First name, MI, Last name] has received the required training required in accordance with §§ 61.309 and 61.311 and have determined that [he or she] is prepared for the [name of] proficiency check.',
  'Proficiency Check',
  false,
  NULL,
  NULL,
  1
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.19',
  'currency-proficiency',
  'CURRENCY AND PROFICIENCY',
  'Passing flight proficiency check for different category or class of aircraft: §§ 61.309',
  '§ 61.309 and',
  'I certify that [First name, MI, Last name] has met the requirements of §§ 61.309 and 61.311 and I have determined [him or her] proficient to act as pilot in command of [category and class] of light-sport aircraft.',
  'Proficiency Check',
  false,
  NULL,
  NULL,
  2
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.65',
  'currency-proficiency',
  'CURRENCY AND PROFICIENCY',
  'Completion of a flight review: § 61.56(a) and (c). No logbook entry reflecting',
  '§ 61.56(a) on',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has satisfactorily completed a flight review of § 61.56(a) on [date].',
  'Flight Review',
  false,
  NULL,
  NULL,
  3
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.20',
  'sport-recreational-pilot',
  'SPORT AND RECREATIONAL PILOT CERTIFICATES',
  'Taking sport pilot practical test: §§ 61.309, 61.311, and 61.313.',
  '§ 61.309 and 61.311 and met the aeronautical experience requirements of',
  'I certify that [First name, MI, Last name] has received the training required in accordance with §§ 61.309 and 61.311 and met the aeronautical experience requirements of § 61.313. I have determined that [he or she] is prepared for the [type of] practical test. Note: The endorsement for a practical test is required in addition to the § 61.39 endorsements provided in endorsements 1 and 2 (see paragraphs A.1 and A.2).',
  'Sport Pilot',
  false,
  NULL,
  NULL,
  1
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.21',
  'sport-recreational-pilot',
  'SPORT AND RECREATIONAL PILOT CERTIFICATES',
  'Passing a sport pilot practical test: §§ 61.309, 61.311, and 61.313. This endorsement is',
  '§ 61.317 and is issued by a Sport Pilot Examiner (SPE).',
  'I certify that [First name, MI, Last name] has met the requirements of §§ 61.309, 61.311, and 61.313, and I have determined [him or her] proficient to act as pilot in command of [category and class of] light-sport aircraft. /s/ [date] S. P. Examiner 987654321 Exp. 12-31-19',
  'Sport Pilot',
  false,
  NULL,
  NULL,
  2
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.27',
  'sport-recreational-pilot',
  'SPORT AND RECREATIONAL PILOT CERTIFICATES',
  'Recreational pilot to operate within 50 NM of the airport where training was',
  '§ 61.101(b).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.101(b). I have determined that [he or she] is competent to operate at the [name of airport].',
  'Recreational Pilot',
  false,
  NULL,
  NULL,
  3
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.28',
  'sport-recreational-pilot',
  'SPORT AND RECREATIONAL PILOT CERTIFICATES',
  'Recreational pilot to act as pilot in command on a flight that exceeds 50 NM of the',
  '§ 61.101(c).',
  'I certify that [First name, MI, Last name] has received the required cross-country training of § 61.101(c). I have determined that [he or she] is proficient in cross-country flying of part 61 subpart E.',
  'Recreational Pilot',
  false,
  NULL,
  NULL,
  4
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.29',
  'sport-recreational-pilot',
  'SPORT AND RECREATIONAL PILOT CERTIFICATES',
  'Recreational pilot with less than 400 flight hours and no logged pilot in command',
  '§ 61.101(g).',
  'I certify that [First name, MI, Last name] has received the required 180-day recurrent training of § 61.101(g) in a [make and model] aircraft. I have determined [him or her] proficient to act as pilot in command of that aircraft.',
  'Recreational Pilot',
  false,
  NULL,
  NULL,
  5
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.30',
  'sport-recreational-pilot',
  'SPORT AND RECREATIONAL PILOT CERTIFICATES',
  'Recreational pilot to conduct solo flights for the purpose of obtaining an additional',
  '§ 61.101(j).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.87 in a [make and model] aircraft. I have determined [he or she] is prepared to conduct a solo flight on [date] under the following conditions: [List all conditions which require endorsement (e.g., flight which requires communication with air traffic control, flight in an aircraft for which the pilot does not hold a category/class rating, etc.).]',
  'Recreational Pilot',
  false,
  NULL,
  NULL,
  6
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.48',
  'sport-recreational-pilot',
  'SPORT AND RECREATIONAL PILOT CERTIFICATES',
  'Sport pilot flight instructor aeronautical knowledge test: §§ 61.35(a)(1) and',
  '§ 61.405(a)(2).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.405(a)(2). I have determined that [he or she] is prepared for the [name of the knowledge test].',
  'Sport Pilot',
  false,
  NULL,
  NULL,
  7
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.53',
  'sport-recreational-pilot',
  'SPORT AND RECREATIONAL PILOT CERTIFICATES',
  'Sport pilot instructor to train sport pilots on flight by reference to instruments:',
  '§ 61.412. This endorsement from an instructor certificated under part 61 subpart H to a',
  'I certify that I have given [First name, MI, Last name] 3 hours of flight training and 1 hour of ground instruction specific to providing flight training on control and maneuvering an airplane solely by reference to the instruments in accordance with § 61.412. I have determined that [he or she] is proficient and authorized to provide training on control and maneuvering an airplane solely by reference to the flight instruments to this instructor’s sport pilot candidate, who intends to operate an LSA airplane with a V H greater than 87 KCAS on a cross-country flight. /s/ [date] Subpart H Instructor 987654321 Exp. 12-31-19',
  'Sport Pilot',
  false,
  NULL,
  NULL,
  8
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.36',
  'pilot-certificates',
  'ADDITIONAL PILOT CERTIFICATES AND RATINGS',
  'Restricted privileges ATP Certificate, Airplane Multiengine Land (AMEL) rating:',
  '§ 61.160. This certifying statement can only be provided by an authorized institution of',
  '',
  'Airline Transport Pilot',
  false,
  NULL,
  NULL,
  1
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.37',
  'pilot-certificates',
  'ADDITIONAL PILOT CERTIFICATES AND RATINGS',
  'ATP Certification Training Program (CTP): § 61.153(e). This endorsement is only',
  '§ 61.156. Refer to AC 61',
  '',
  'Airline Transport Pilot',
  false,
  NULL,
  NULL,
  2
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.74',
  'pilot-certificates',
  'ADDITIONAL PILOT CERTIFICATES AND RATINGS',
  'Additional aircraft category or class rating (other than ATP): § 61.63(b) or (c).',
  '§ 61.63(b) or (c).',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training for an additional [aircraft category/class rating]. I have determined that [he or she] is prepared for the [name of] practical test for the addition of a [name of] [specific aircraft category/class/type] type rating.',
  'Airline Transport Pilot',
  false,
  NULL,
  NULL,
  3
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.84',
  'pilot-certificates',
  'ADDITIONAL PILOT CERTIFICATES AND RATINGS',
  'Experimental aircraft only—additional aircraft category or class rating ATP:',
  '§ 61.65(g).',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], as required by § 61.65(g) is proficient to act as pilot in command in a [category, class, make, and model] of experimental aircraft and has logged at least 5 hours flight time logged between September 1, 2004, and August 31, 2005, while acting as pilot in command in [aircraft category/class rating and make and model] that has been issued an experimental certificate.',
  'Airline Transport Pilot',
  false,
  NULL,
  NULL,
  4
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.40',
  'instrument-ratings',
  'INSTRUMENT RATINGS',
  'Prerequisites for instrument practical tests: § 61.39(a).',
  '§ 61.39(a) in preparation for the practical test within 2 calendar',
  'I certify that [First name, MI, Last name] has received and logged the required flight time/training of § 61.39(a) in preparation for the practical test within 2 calendar-months preceding the date of the test and has satisfactory knowledge of the subject areas in which [he or she] was shown to be deficient by the FAA Airman Knowledge Test Report. I have determined [he or she] is prepared for the Instrument–[airplane, helicopter, or powered lift] practical test. FLIGHT INSTRUCTOR (OTHER THAN FLIGHT INSTRUCTORS WITH A SPORT PILOT RATING) ENDORSEMENTS',
  'Instrument Rating',
  false,
  NULL,
  NULL,
  1
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.67',
  'instrument-ratings',
  'INSTRUMENT RATINGS',
  'Completion of an instrument proficiency check: § 61.57(d). No logbook entry',
  '§ 61.57(d) in a',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has satisfactorily completed the instrument proficiency check of § 61.57(d) in a [make and model] aircraft on [date].',
  'Instrument Rating',
  false,
  NULL,
  NULL,
  2
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.42',
  'flight-instructor',
  'FLIGHT INSTRUCTOR CERTIFICATES',
  'Flight instructor aeronautical knowledge test: § 61.183(f).',
  '§ 61.185(a)',
  'I certify that [First name, MI, Last name] has received the required training of § 61.185(a)[(2) or (3) (as appropriate to the flight instructor rating sought)]. I have determined that [he or she] is prepared for the [name of] knowledge test.',
  'Flight Instructor',
  false,
  NULL,
  NULL,
  1
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.43',
  'flight-instructor',
  'FLIGHT INSTRUCTOR CERTIFICATES',
  'Flight instructor ground and flight proficiency/practical test: § 61.183(g).',
  '§ 61.187(b).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.187(b). I have determined that [he or she] is prepared for the CFI – [aircraft category and class] practical test. Note: The endorsement for a practical test is required in addition to the § 61.39 endorsements provided in endorsements 1 and 2 (see paragraphs A.1 and A.2).',
  'Flight Instructor',
  false,
  NULL,
  NULL,
  2
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.44',
  'flight-instructor',
  'FLIGHT INSTRUCTOR CERTIFICATES',
  'Flight instructor certificate with instrument—(category/class) rating/practical test:',
  '§ 61.183(g)',
  'I certify that [First name, MI, Last name] has received the required certificated flight instructor – instrument training of § 61.187(b)(7). I have determined [he or she] is prepared for the certificated flight instructor – instrument – [airplane, helicopter, or powered-lift] practical test.',
  'Flight Instructor',
  false,
  NULL,
  NULL,
  3
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.46',
  'flight-instructor',
  'FLIGHT INSTRUCTOR CERTIFICATES',
  'Helicopter Touchdown Autorotation: FAA-S-8081-7, Flight Instructor Practical',
  NULL,
  'I certify that [First name, MI, Last name] has received training in straight-in and 180-degree autorotations to include touchdown. I have determined that [he or she] is competent in instructional knowledge relating to the elements, common errors, performance, and correction of common errors related to straight-in and 180-degree autorotations.',
  'Flight Instructor',
  false,
  NULL,
  NULL,
  4
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.49',
  'flight-instructor',
  'FLIGHT INSTRUCTOR CERTIFICATES',
  'Flight instructor flight proficiency check to provide training if a different category',
  '§ 61.409 and 61.419.',
  'I certify that [First name, MI, Last name] has received the required training in accordance with §§ 61.409 and 61.419 and have determined that [he or she] is prepared for a proficiency check for the flight instructor with a sport pilot rating in a [aircraft category and class].',
  'Flight Instructor',
  false,
  NULL,
  NULL,
  5
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.50',
  'flight-instructor',
  'FLIGHT INSTRUCTOR CERTIFICATES',
  'Passing the flight instructor flight proficiency check to provide training in a',
  '§ 61.409',
  'I certify that [First name, MI, Last name] has met the requirements in accordance with §§ 61.409 and 61.419. I have determined that [he or she] is proficient and authorized for the additional [aircraft category and class] flight instructor privilege.',
  'Flight Instructor',
  false,
  NULL,
  NULL,
  6
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.51',
  'flight-instructor',
  'FLIGHT INSTRUCTOR CERTIFICATES',
  'Flight instructor practical test: §§ 61.409 and 61.411. This endorsement is required in',
  '§ 61.39 endorsements provided in paragraphs A.1 and A.2.',
  'I certify that [First name, MI, Last name] has received the required training of § 61.409 and met the aeronautical experience requirements of § 61.411. I have determined that [he or she] is prepared for the flight instructor with a sport pilot rating practical test in a [aircraft category and class]. /s/ [date] S. P. Examiner 987654321 Exp. 12-31-19',
  'Flight Instructor',
  false,
  NULL,
  NULL,
  7
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.52',
  'flight-instructor',
  'FLIGHT INSTRUCTOR CERTIFICATES',
  'Passing the flight instructor practical test: §§ 61.409 and 61.411. This endorsement is',
  '§ 61.417 and is issued by a Designated Pilot Examiner (DPE).',
  'I certify that [First name, MI, Last name] has met the requirements in accordance with §§ 61.409 and 61.411. I have determined that [he or she] is proficient and authorized for the [aircraft category and class] flight instructor privilege. /s/ [date] S. P. Examiner 987654321 Exp. 12-31-19',
  'Flight Instructor',
  false,
  NULL,
  NULL,
  8
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.59',
  'flight-instructor',
  'FLIGHT INSTRUCTOR CERTIFICATES',
  'R-22 flight instructor endorsement: SFAR 73, section 2(b)(5)(iv). This endorsement',
  'SFAR 73',
  'I certify that [First name, MI, Last name], holder of CFI Certificate No. [_____], meets the experience requirements, and has completed the flight training specified by SFAR 73, section 2(b)(5)(i–ii) and (iii)(A–D), and has demonstrated an ability to provide instruction on the general subject areas of SFAR 73, section 2(a)(3) and the flight training identified in SFAR 73, section 2(b)(5)(iii) in a Robinson R-22 helicopter. /s/ [date] J. J. Jones DPE Designation Number, Exp. 12-31-19; or /s/ [date] I. M. Inspector FAA Aviation Safety Inspector',
  'Flight Instructor',
  false,
  NULL,
  NULL,
  9
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.63',
  'flight-instructor',
  'FLIGHT INSTRUCTOR CERTIFICATES',
  'R-44 flight instructor endorsement: SFAR 73, section 2(b)(5)(iv). This endorsement',
  'SFAR 73',
  'I certify that [First name, MI, Last name], holder of CFI Certificate No. [_____], meets the experience requirements and has completed the flight training specified by SFAR 73, section 2(b)(5)(i–ii) and (iii)(A–D), and has demonstrated an ability to provide instruction on the general subject areas of SFAR 73, section 2(a)(3) and the flight training identified in SFAR 73, section 2(b)(5)(iii) in a Robinson R-44 helicopter. /s/ [date] J. J. Jones DPE Designation Number, Exp. 12-31-19; or /s/ [date] I. M. Inspector FAA Aviation Safety Inspector',
  'Flight Instructor',
  false,
  NULL,
  NULL,
  10
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.56',
  'helicopter-sfar',
  'HELICOPTER ENDORSEMENTS (SFAR 73)',
  'R-22/R-44 awareness training: SFAR 73, section 2(a)(1) or (2).',
  'SFAR 73',
  'I certify that [First name, MI, Last name, Pilot Certificate No. _____] has received the Awareness Training required by SFAR 73, section 2(a)(3)(i–v).',
  'Helicopter - SFAR 73',
  false,
  NULL,
  NULL,
  1
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.57',
  'helicopter-sfar',
  'HELICOPTER ENDORSEMENTS (SFAR 73)',
  'R-22 solo endorsement: SFAR 73, section 2(b)(3).',
  'SFAR 73',
  'I certify that [First name, MI, Last name, Pilot Certificate No. _____] meets the experience requirements of SFAR 73, section 2(b)(3) and has been given training specified by SFAR 73, section 2(b)(3)(i–iv). [He or She] has been found proficient to solo the R-22 helicopter.',
  'Helicopter - SFAR 73',
  false,
  NULL,
  NULL,
  2
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.58',
  'helicopter-sfar',
  'HELICOPTER ENDORSEMENTS (SFAR 73)',
  'R-22 pilot-in-command endorsement: SFAR 73, section 2(b)(1)(ii).',
  'SFAR 73',
  'I certify that [First name, MI, Last name, Pilot Certificate No. _____] has been given training specified by SFAR 73, section 2(b)(1)(ii)(A–D) for Robinson R-22 helicopters and is proficient to act as pilot in command. An annual flight review must be completed by [date 12 calendar-months after date of this endorsement] unless the requirements of SFAR 73, section 2(b)(1)(i) are met.',
  'Helicopter - SFAR 73',
  false,
  NULL,
  NULL,
  3
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.60',
  'helicopter-sfar',
  'HELICOPTER ENDORSEMENTS (SFAR 73)',
  'Flight review in an R-22 helicopter: SFAR 73, section 2(c)(1) and (3).',
  '§ 61.56 and SFAR 73',
  'I certify that [First name, MI, Last name, Pilot Certificate No. _____] has satisfactorily completed the flight review in an R-22 required by § 61.56 and SFAR 73, section 2(c)(1) and (3), on [date of flight review].',
  'Helicopter - SFAR 73',
  false,
  NULL,
  NULL,
  4
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.61',
  'helicopter-sfar',
  'HELICOPTER ENDORSEMENTS (SFAR 73)',
  'R-44 solo endorsement: SFAR 73, section 2(b)(4).',
  'SFAR 73',
  'I certify that [First name, MI, Last name, Pilot Certificate No. _____] meets the experience requirements of SFAR 73, section 2(b)(4) and has been given training specified by SFAR 73, section 2(b)(4)(i–iv). [He or She] has been found proficient to solo the R-44 helicopter.',
  'Helicopter - SFAR 73',
  false,
  NULL,
  NULL,
  5
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.62',
  'helicopter-sfar',
  'HELICOPTER ENDORSEMENTS (SFAR 73)',
  'R-44 pilot-in-command endorsement: SFAR 73, section 2(b)(2)(ii).',
  'SFAR 73',
  'I certify that [First name, MI, Last name, Pilot Certificate No. _____] has been given training specified by SFAR 73, section 2(b)(2)(ii)(A–D) for Robinson R-44 helicopters and is proficient to act as pilot in command. An annual flight review must be completed by [date 12 calendar-months after date of this endorsement] unless the requirements of SFAR 73, section 2(b)(2)(i) are met.',
  'Helicopter - SFAR 73',
  false,
  NULL,
  NULL,
  6
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.64',
  'helicopter-sfar',
  'HELICOPTER ENDORSEMENTS (SFAR 73)',
  'Flight review in an R-44 helicopter: SFAR 73, section 2(c)(2) and (3).',
  '§ 61.56 and SFAR 73',
  'I certify that [First name, MI, Last name, Pilot Certificate No. _____] has satisfactorily completed the flight review in an R-44 required by 14 CFR, § 61.56 and SFAR 73, section 2(c)(2) and (3), on [date of flight review].',
  'Helicopter - SFAR 73',
  false,
  NULL,
  NULL,
  7
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.68',
  'complex-high-performance',
  'COMPLEX, HIGH PERFORMANCE, AND TAILWHEEL ENDORSEMENTS',
  'To act as pilot in command in a complex airplane: § 61.31(e).',
  '§ 61.31(e) in a',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training of § 61.31(e) in a [make and model] complex airplane. I have determined that [he or she] is proficient in the operation and systems of a complex airplane.',
  'Complex Aircraft',
  false,
  NULL,
  NULL,
  1
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.69',
  'complex-high-performance',
  'COMPLEX, HIGH PERFORMANCE, AND TAILWHEEL ENDORSEMENTS',
  'To act as pilot in command in a high-performance airplane: § 61.31(f).',
  '§ 61.31(f) in a',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training of § 61.31(f) in a [make and model] high performance airplane. I have determined that [he or she] is proficient in the operation and systems of a high-performance airplane.',
  'High Performance',
  false,
  NULL,
  NULL,
  2
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.70',
  'complex-high-performance',
  'COMPLEX, HIGH PERFORMANCE, AND TAILWHEEL ENDORSEMENTS',
  'To act as pilot in command in a pressurized aircraft capable of high-altitude',
  '§ 61.31(g).',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training of § 61.31(g) in a [make and model] pressurized aircraft. I have determined that [he or she] is proficient in the operation and systems of a pressurized aircraft.',
  'Pressurized Aircraft',
  false,
  NULL,
  NULL,
  3
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.71',
  'complex-high-performance',
  'COMPLEX, HIGH PERFORMANCE, AND TAILWHEEL ENDORSEMENTS',
  'To act as pilot in command in a tailwheel airplane: § 61.31(i). This endorsement may',
  '§ 61.31(i) in a',
  'I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training of § 61.31(i) in a [make and model] of tailwheel airplane. I have determined that [he or she] is proficient in the operation of a tailwheel airplane.',
  'Tailwheel',
  false,
  NULL,
  NULL,
  4
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.75',
  'type-ratings',
  'TYPE RATINGS',
  'Type rating only, already holds the appropriate category or class rating (other than',
  '§ 61.63(d)(2).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.63(d)(2) for an addition of a [name of] type rating.',
  'Type Rating',
  false,
  NULL,
  NULL,
  1
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.76',
  'type-ratings',
  'TYPE RATINGS',
  'Type rating concurrently with an additional category or class rating (other than',
  '§ 61.63(d)(2).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.63(d)(2) for an addition of a [name of] [specific category/class/type] type rating. I have determined that [he or she] is prepared for the [name of] practical test for the addition of a [name of] [specific aircraft category/class/type] type rating.',
  'Type Rating',
  false,
  NULL,
  NULL,
  2
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.77',
  'type-ratings',
  'TYPE RATINGS',
  'Type rating only, already holds the appropriate category or class rating (at the',
  '§ 61.157(b)(2).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.157(b)(2) for an addition of a [name of] type rating.',
  'Type Rating',
  false,
  NULL,
  NULL,
  3
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.78',
  'type-ratings',
  'TYPE RATINGS',
  'Type rating concurrently with an additional category or class rating (at the',
  '§ 61.157(b)(2).',
  'I certify that [First name, MI, Last name] has received the required training of § 61.157(b)(2) for an addition of a [name of the specific category/class/type] type rating.',
  'Type Rating',
  false,
  NULL,
  NULL,
  4
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();

