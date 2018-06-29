UPDATE flights
SET checked_in = true
WHERE flight_id = $1;