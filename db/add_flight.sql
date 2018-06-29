INSERT INTO flights
(user_id, confirmation_number, firstname, lastname, departure_date, check_in_date, created_date, checked_in, tripname, email, error_message)
VALUES
($1, $2, $3, $4, $5, $6, $7, false, $8, $9, null);