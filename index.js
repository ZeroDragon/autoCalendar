const connect = require('./connect')
const Event = require('./events').Event
let auth
let google

connect.gogoogle(resp => {
  auth = resp.auth
  google = resp.google
  ready()
})

const getStartOfDay = () => {
  const nDate = new Date()
  nDate.setHours(0)
  nDate.setMinutes(0)
  nDate.setSeconds(0)
  nDate.setMilliseconds(0)
  return nDate
}

const listEvents = callback => {
  const today = getStartOfDay()
  const endOfToday = new Date(today.getTime())
  endOfToday.setDate(endOfToday.getDate() + 1)
  endOfToday.setSeconds(endOfToday.getSeconds() - 1)
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: today.toISOString(),
    timeMax: endOfToday.toISOString(),
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    callback(events)
  });
}

const createEvent = event => {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.insert({
    auth, calendarId: 'primary',
    resource: event
  }, (err, ev) => {
    if (err) throw err.message
    console.log(new Date(ev.data.start.dateTime))
  })
}

const getGaps = events => {
  const availableHours = [... new Array(24).fill(null, 0, 24)]
  availableHours.fill(true, 10, 20)
  events.forEach(event => {
    const init = new Date(event.start.dateTime).getHours()
    const end = new Date(event.end.dateTime).getHours()
    availableHours.fill(null, init, end)
  })
  gaps = availableHours
    .map((value, index) => {
      if (value) return index
      return null
    })
    .filter(value => value)
    .filter(value => {
      const now = new Date().getHours()
      return value >= now
    })
    .map(hour => {
      const start = getStartOfDay()
      start.setHours(hour)
      const end = new Date(start.getTime())
      end.setHours(end.getHours() + 1)
      const event = new Event({
        start: start.toISOString(),
        end: end.toISOString()
      })
      return event
    })
    .forEach(event => {
      const date = new Date(event.start.dateTime)
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
      // console.log(date)
      createEvent(event)
    })
}


const ready = () =>{
  listEvents(getGaps)

  // const event = new Event()
  // console.log(event)
  // createEvent(event)
}
