require('dotenv').config();
const express = require('express')
    , session = require('express-session')
    , passport = require('passport')
    , Auth0Strategy = require('passport-auth0')
    , massive = require('massive')
    , bodyParser = require('body-parser')
    , controller = require('./controller')

const CronJob = require('cron').CronJob;
const moment = require('moment');
const puppeteer = require('puppeteer');


const {
    CONNECTION_STRING,
    SERVER_PORT,
    SESSION_SECRET,
    DOMAIN,
    CLIENT_ID,
    CLIENT_SECRET,
    CALLBACK_URL
} = process.env;

const app = express();

app.use(express.static(`${__dirname}/../build`));

app.use(bodyParser.json());

massive(CONNECTION_STRING).then((db) => {
    app.set('db', db);
})

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Auth0Strategy({
    domain: DOMAIN,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    //this scope defines what info you can get back from the authorization
    scope: 'openid profile email'
}, (accessToken, refreshToken, extraParams, profile, done) => {
    let db = app.get('db');
    let { picture, email } = profile._json;
    db.find_user([email]).then((foundUser) => {
        if (foundUser[0]) {
            done(null, { email: foundUser[0].email})
        } else {
            done(null, null)
        }
    })
    }))

passport.serializeUser((profile, done) => {
    done(null, profile);
})
passport.deserializeUser((profile, done) => {
    //whatever we pass out of the done method here will end up on req.user. So user will be there. 
    app.get('db').find_user([profile.email]).then((user) => {
        done(null, Object.assign({}, user[0]));
    });
})

//To set up perma-user
app.use((req, res, next) => {
    // req.user = {
    //     email: 'bloomfield.andrew@gmail.com',
    //     user_id: 1,
    //     pro_user: true,
    //     admin: true,
    //     firstname: 'Andrew',
    //     lastname: 'Bloomfield'
    // }
    // next()
    req.user = {
        email: 'test@user.com',
        user_id: 2,
        pro_user: true,
        admin: true,
        firstname: 'Test',
        lastname: 'User'
    }
    next()
})

app.get('/login', passport.authenticate('auth0'));
app.get('/auth/callback', passport.authenticate('auth0', {
    successRedirect: process.env.SUCCESS_REDIRECT,
    failureRedirect: process.env.FAILURE_REDIRECT
}));

//Authentication Calls
app.get('/auth/me', (req, res, next) => {
    res.send(req.user)
})

//Flight Calls
app.post('/api/flights', controller.addFlight)
app.get('/api/flights', controller.getUserFlights)
app.delete('/api/flights/:flight_id/:password', controller.deleteFlight)

//Puppeteer Automation
let checkIn = async (confirmationNumber, firstName, lastName, email, flight_id) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    //Navigate to Southwest.com and Click on the Check-in button
    await page.goto('https://southwest.com');
    // await page.setViewport({ width: 1000, height: 500 });
    await page.click('#booking-form--check-in-tab > span.booking-form--menu-options-option-label');
    await page.waitFor(1000);

    //Fill out the form and click submit
    await page.type('#confirmationNumber', confirmationNumber);
    await page.type('#firstName', firstName);
    await page.type('#lastName', lastName);
    page.click('#jb-button-check-in');

    //Wait for the footer to load, then wait 1 more second for any error messages to appear.
    await page.waitForSelector('body > div > div > div > div > div.layer.layer_relative.overlay-event-handler > div.footer > div > div:nth-child(1) > div:nth-child(1) > div.footer-callout--container > div:nth-child(1) > div > a');
    await page.waitFor(1000);

    //If there is an error message, evaluate what the error is.
    if (await page.$('#swa-content > div > div.container.container_standard.page-notifications > div.page-error.page-error_results.notifications--item > div > div > h2') !== null) {
        const error = await page.evaluate(() => document.querySelector('#swa-content > div > div.container.container_standard.page-notifications > div.page-error.page-error_results.notifications--item > div > div > h2').innerText);
        
        //If the error is that we are too early, end the process and try again at the top of the minute. Otherwise, send the error to DB and mark as checked in, so the system doesn't try again.
        if (error !== 'Online check-in not valid at this time.') {
            await app.get('db').update_check_in_with_error([flight_id, error]).then(() => browser.close())
        } else {
            await browser.close()
        }
        

    //If not, Proceed
    } else {
        //If successfully logged in, click the log-in confirmation button
        await page.waitForSelector('#swa-content > div > div:nth-child(2) > div > section > div > div > div.air-check-in-review-results--confirmation > button');
        await page.click('#swa-content > div > div:nth-child(2) > div > section > div > div > div.air-check-in-review-results--confirmation > button');
        
        //Tell the DB we successfully checked them in (this way if the email fails, we still correctly notify that they were successfully checked in.)
        await app.get('db').update_checked_in([flight_id])

        //Then click on the email button, enter your email, and submit the form.
        await page.waitForSelector('#swa-content > div > div:nth-child(2) > div > section > div > div > section > table > tbody > tr > td:nth-child(2) > button');
        await page.click('#swa-content > div > div:nth-child(2) > div > section > div > div > section > table > tbody > tr > td:nth-child(2) > button');
        await page.waitForSelector('#emailBoardingPass');
        await page.type('#emailBoardingPass', email);
        await page.click('#form-mixin--submit-button');
        await browser.close()
    }
};


//CRON Scheduling to check DB for flights, then execute puppeteer code.
let checkDatabase = new CronJob('00 * * * * *', () => {

    const now = moment.utc(new Date()).format();
    if (app.get('db')) {
        app.get('db').search_flights([now])
            .then(flights => {
                if (flights[0]) {
                    flights.map(flight => {
                        const { confirmation_number, firstname, lastname, flight_id, email } = flight;
                            checkIn(confirmation_number, firstname, lastname, email, flight_id)
                                .then()
                    })
                } else {
                    // console.log('no flights!')
                }
            });
    } else {
        // console.log('massive not connected')
    }

}, null, true);

app.listen(SERVER_PORT, () => console.log(`You've been served on port: ${SERVER_PORT}`))
