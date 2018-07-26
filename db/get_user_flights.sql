SELECT *
FROM flights
WHERE user_id = $1
ORDER BY flight_id;