const excuses = require('./excuses.json')
class Event {
  constructor (params = {}) {
    const alibi = excuses[Math.round(Math.random() * (excuses.length - 1))]
    const now = new Date()
    const later = new Date()
    const timeZone = params.timeZone || 'America/Mexico_City'
    let laterMinutes = 30
    if (params.maxTime) {
      later.setTime(params.start.getTime())
      // max time is needed - 30 to avoid going overtime
      const maxTime = params.maxTime - 30
      // get a random time between 30 and maxtime
      const random = Math.round(Math.random() * maxTime) + 30
      // round time to blocks of 15 minutes
      laterMinutes = Math.round(random / 15) * 15
    }
    later.setMinutes(later.getMinutes() + laterMinutes)
    const pParams = {
      summary: params.summary || alibi,
      start: {
        dateTime: params.start.toISOString() || now.toISOString(),
        timeZone
      },
      end: {
        dateTime: params.end?.toISOString() || later.toISOString(),
        timeZone
      },
      reminders: {
        useDefault: false
      },
      colorId: '3'
    }
    for (var key in pParams) {
      this[key] = pParams[key]
    }
  }
}

module.exports.Event = Event
