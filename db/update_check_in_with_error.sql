UPDATE flights
SET checked_in = true, error_message = $2
WHERE flight_id = $1;