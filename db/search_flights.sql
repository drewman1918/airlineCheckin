SELECT *
FROM flights
WHERE check_in_date <= $1 and checked_in = false;