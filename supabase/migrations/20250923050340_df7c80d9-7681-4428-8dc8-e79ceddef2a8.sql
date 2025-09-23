-- Clear existing flight data for fresh debugging import
DELETE FROM flight_entries WHERE date >= '2018-01-01' AND date < '2020-01-01';