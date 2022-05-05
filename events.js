class Event {
  constructor (params = {}) {
    const now = new Date()
    const later = new Date()
    const timeZone = params.timeZone || 'America/Mexico_City'
    later.setMinutes(later.getMinutes() + 30)
    const pParams = {
      summary: params.summary || 'Ocupado',
      start: {
        dateTime: params.start || now.toISOString(),
        timeZone
      },
      end: {
        dateTime: params.end || later.toISOString(),
        timeZone
      }
    }
    for (var key in pParams) {
      this[key] = pParams[key]
    }
  }
}

module.exports.Event = Event
