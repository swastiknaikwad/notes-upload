const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = 3001;
const { google } = require('googleapis');
const { OAuth2 } = google.auth;
// var eventStartTime, eventEndTime;

const oAuth2Client = new OAuth2(
  'PAST HERE CLIENT ID',
  'PAST HERE Client secret'
)

oAuth2Client.setCredentials({
  refresh_token: 'PAST HERE Refresh token',
})

// Create a new calender instance.
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

app.get('/notes/read', (req, res) => {
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    if (res.data.items.length) {
        console.log('Upcoming 10 events:');
        res.data.items.map((event, i) => {
          const start = event.start.dateTime || event.start.date;        
          console.log(`${start} - ${event.summary}`);
        });
      } else {
        console.log('No upcoming events found.');
      }
  });
})

app.post('/notes/save', (req, res) => {

const eventStartTime = new Date()
eventStartTime.setDate(eventStartTime.getDay() + 2)

const eventEndTime = new Date()
eventEndTime.setDate(eventEndTime.getDay() + 2)
eventEndTime.setMinutes(eventEndTime.getMinutes() + 45)

const event = {
  summary: `New Meeting Created Just`,
  location: `Narayana Arcade, No 47/1, 2nd Floor, Subbarama Chetty Rd, Basavanagudi, Bengaluru, Karnataka 560004`,
  description: `Online Assignment`,
  colorId: 2,
  start: {
    dateTime: eventStartTime,
    timeZone: 'Asia/Kolkata',
  },
  end: {
    dateTime: eventEndTime,
    timeZone: 'Asia/Kolkata',
  },
}

// Check if we a busy and have an event on our calendar for the same time.
calendar.freebusy.query(
  {
    resource: {
      timeMin: eventStartTime,
      timeMax: eventEndTime,
      timeZone: 'America/Denver',
      items: [{ id: 'primary' }],
    },
  },
  (err, resp) => {
    if (err) return console.error('Free Busy Query Error: ', err)
    const eventArr = resp.data.calendars.primary.busy
    if (eventArr.length === 0)
      return calendar.events.insert(
        { calendarId: 'primary', resource: event },
        err => {
          if (err) return console.error('Error Creating Calender Event:', err)
          var msg = "Calendar event successfully created.";
          return res.status(201).json(msg);
        }
      )

    // If event array is not empty log that we are busy.
    var busyMsg = "Event already present on that date";
    return res.status(200).json(busyMsg);
  }
)
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
