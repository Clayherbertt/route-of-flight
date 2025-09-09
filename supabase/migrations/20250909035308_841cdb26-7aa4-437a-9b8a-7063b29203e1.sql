-- Update regional carriers with comprehensive base information

-- Air Wisconsin (operates for American Eagle)
UPDATE airlines SET bases = ARRAY['Chicago (ORD)', 'Atlanta (ATL)', 'Washington DC (DCA)'] WHERE name = 'Air Wisconsin';

-- Alaska Seaplanes
UPDATE airlines SET bases = ARRAY['Juneau (JNU)', 'Ketchikan (KTN)', 'Sitka (SIT)'] WHERE name = 'Alaska Seaplanes';

-- Cape Air
UPDATE airlines SET bases = ARRAY['Boston (BOS)', 'Hyannis (HYA)', 'Nantucket (ACK)', 'Martha''s Vineyard (MVY)', 'San Juan (SJU)'] WHERE name = 'Cape Air';

-- CommutAir (operates for United Express)
UPDATE airlines SET bases = ARRAY['Cleveland (CLE)', 'Washington DC (IAD)', 'Newark (EWR)'] WHERE name = 'CommutAir';

-- Contour Airlines
UPDATE airlines SET bases = ARRAY['Nashville (BNA)', 'Charlotte (CLT)', 'Santa Barbara (SBA)'] WHERE name = 'Contour Airlines';

-- Denver Air Connection
UPDATE airlines SET bases = ARRAY['Denver (DEN)'] WHERE name = 'Denver Air Connection';

-- Elite Airways
UPDATE airlines SET bases = ARRAY['Portland (PWM)', 'Boston (BOS)'] WHERE name = 'Elite Airways';

-- Endeavor Air (operates for Delta Connection)
UPDATE airlines SET bases = ARRAY['Atlanta (ATL)', 'Detroit (DTW)', 'Minneapolis (MSP)', 'New York JFK (JFK)', 'Cincinnati (CVG)'] WHERE name = 'Endeavor Air';

-- Envoy Air (operates for American Eagle)
UPDATE airlines SET bases = ARRAY['Dallas (DFW)', 'Chicago (ORD)', 'Miami (MIA)', 'New York (LGA)'] WHERE name = 'Envoy Air';

-- ExpressJet Airlines
UPDATE airlines SET bases = ARRAY['Houston (IAH)', 'Newark (EWR)', 'Chicago (ORD)'] WHERE name = 'ExpressJet Airlines';

-- GoJet Airlines (operates for United Express and Delta Connection)
UPDATE airlines SET bases = ARRAY['Chicago (ORD)', 'Denver (DEN)', 'Minneapolis (MSP)'] WHERE name = 'GoJet Airlines';

-- Grant Aviation
UPDATE airlines SET bases = ARRAY['Anchorage (ANC)', 'Fairbanks (FAI)', 'Nome (OME)'] WHERE name = 'Grant Aviation';

-- Great Lakes Airlines
UPDATE airlines SET bases = ARRAY['Denver (DEN)', 'Phoenix (PHX)', 'Los Angeles (LAX)'] WHERE name = 'Great Lakes Airlines';

-- Horizon Air (operates for Alaska Airlines)
UPDATE airlines SET bases = ARRAY['Seattle (SEA)', 'Portland (PDX)', 'Spokane (GEG)', 'Boise (BOI)'] WHERE name = 'Horizon Air';

-- Mesa Airlines (operates for American Eagle and United Express)
UPDATE airlines SET bases = ARRAY['Phoenix (PHX)', 'Washington DC (DCA)', 'Houston (IAH)', 'Denver (DEN)'] WHERE name = 'Mesa Airlines';

-- Ohana by Hawaiian
UPDATE airlines SET bases = ARRAY['Honolulu (HNL)', 'Kahului (OGG)'] WHERE name = 'Ohana by Hawaiian';

-- Piedmont Airlines (operates for American Eagle)
UPDATE airlines SET bases = ARRAY['Philadelphia (PHL)', 'Charlotte (CLT)', 'Washington DC (DCA)'] WHERE name = 'Piedmont Airlines';

-- PSA Airlines (operates for American Eagle)
UPDATE airlines SET bases = ARRAY['Charlotte (CLT)', 'Washington DC (DCA)', 'Philadelphia (PHL)', 'Phoenix (PHX)'] WHERE name = 'PSA Airlines';

-- Quantum Air
UPDATE airlines SET bases = ARRAY['Miami (MIA)', 'Fort Lauderdale (FLL)'] WHERE name = 'Quantum Air';

-- Raven Alaska
UPDATE airlines SET bases = ARRAY['Anchorage (ANC)', 'Fairbanks (FAI)'] WHERE name = 'Raven Alaska';

-- Republic Airways (operates for American Eagle, Delta Connection, and United Express)
UPDATE airlines SET bases = ARRAY['Indianapolis (IND)', 'Pittsburgh (PIT)', 'Washington DC (DCA)', 'Denver (DEN)', 'Chicago (ORD)'] WHERE name = 'Republic Airways';

-- Seaborne Airlines
UPDATE airlines SET bases = ARRAY['San Juan (SJU)', 'St. Thomas (STT)', 'St. Croix (STX)'] WHERE name = 'Seaborne Airlines';

-- Silver Airways
UPDATE airlines SET bases = ARRAY['Fort Lauderdale (FLL)', 'Tampa (TPA)', 'Orlando (MCO)', 'Key West (EYW)'] WHERE name = 'Silver Airways';

-- SkyWest (operates for American Eagle, Delta Connection, United Express, and Alaska Airlines)
UPDATE airlines SET bases = ARRAY['Salt Lake City (SLC)', 'Los Angeles (LAX)', 'San Francisco (SFO)', 'Denver (DEN)', 'Chicago (ORD)', 'Phoenix (PHX)', 'Portland (PDX)', 'Seattle (SEA)'] WHERE name = 'SkyWest';