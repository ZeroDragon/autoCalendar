const connect = require('./connect')
const Event = require('./events').Event
let auth
let google

const INITHOURS = 15
const ENDHOURS = 21

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

const createEvent = async (event, cb) => {
  const p = new Promise((resolve, reject) => {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.insert({
      auth, calendarId: 'primary',
      resource: event
    }, (err, ev) => {
      if (err) console.log(err)
      console.log(new Date(ev.data.start.dateTime))
      return resolve()
    })
  })
  return p
}

const saveEvents = async (events, index = 0) => {
  if (!events[index]) return
  await createEvent(events[index])
  saveEvents(events, index + 1)
}

const generateEvents = (initial, end, acum = []) => {
  const time = getStartOfDay()
  let lastAlibi = null
  if (acum[0]) {
    lastAlibi = [...acum].pop().summary
  }
  time.setMinutes(initial)
  if (end - initial <= 30) {
    if (end - initial === 0) return acum
    const timeEnd = getStartOfDay()
    timeEnd.setMinutes(end)
    const event = new Event({
      start: time,
      end: timeEnd
    })
    if (event.summary === lastAlibi) {
      return generateEvents(initial, end, acum)
    }
    acum.push(event)
    return acum
  }
  const event = new Event({
    start: time,
    maxTime: Math.min(end - initial, 60)
  })
  if (event.summary === lastAlibi) {
    return generateEvents(initial, end, acum)
  }
  const endTime = new Date(event.end.dateTime)
  const endMinutes = endTime.getHours() * 60 + endTime.getMinutes()
  acum.push(event)
  return generateEvents(endMinutes, end, acum)
}

const getGaps = events => {
  const availableMinutes = [... new Array(1440).fill(null, 0, 1440)]
  const initMinute = INITHOURS * 60
  const endMinute = ENDHOURS * 60
  availableMinutes.fill(true, initMinute + 1, endMinute)
  events.forEach(event => {
    const init = new Date(event.start.dateTime)
    const initialMinute = init.getHours() * 60 + init.getMinutes()
    const end = new Date(event.end.dateTime)
    const endMinute = end.getHours() * 60 + end.getMinutes()
    availableMinutes.fill(null, initialMinute, endMinute)
  })
  gaps = availableMinutes
    .map((value, index) => {
      if (value) return index
      return null
    })
    .filter(value => value)
  let groups = []
  let index = 0
  gaps.forEach(minute => {
    if (!groups[index]) {
      groups[index] = [minute, minute]
      return
    }
    if (groups[index][1] === minute - 1) {
      groups[index][1] = minute
      return
    }
    index = index + 1
  })
  groups = groups
    .flatMap(([init, end]) => {
      const gapInit = init - 1
      const gapEnd = end + 1
      return generateEvents(gapInit, gapEnd)
    })
  // console.log(groups)
  saveEvents(groups)
    // .filter(value => {
      // const now = new Date().getHours()
      // return value >= now
    // })
    // .map(hour => {
      // const start = getStartOfDay()
      // start.setHours(hour)
      // const end = new Date(start.getTime())
      // end.setHours(end.getHours() + 1)
      // const event = new Event({
        // start: start.toISOString(),
        // end: end.toISOString()
      // })
      // return event
    // })
    // .forEach(event => {
      // createEvent(event)
    // })
}


const ready = () =>{
  listEvents(getGaps)
}
