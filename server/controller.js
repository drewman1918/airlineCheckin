module.exports = {
    addFlight: (req, res) => {
        const { user_id } = req.user;
        const { confirmation_number, firstname, lastname, departure_date, check_in_date, created_date, tripname, email } = req.body;
        req.app.get('db').add_flight([user_id, confirmation_number, firstname, lastname, departure_date, check_in_date, created_date, tripname, email])
            .then( () => res.sendStatus(200))
    },

    getUserFlights: (req, res) => {
        const { user_id } = req.user;
        req.app.get('db').get_user_flights([user_id])
            .then( flights => res.status(200).send(flights))
    },

    deleteFlight: (req, res) => {
        const { flight_id } = req.params;
        req.app.get('db').delete_flight([flight_id])
            .then( res.sendStatus(200))
    }
}