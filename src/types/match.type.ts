export type Match = {
  [key: string]: {
      id: string,
      status: string,
      scores: {CURRENT: {
        type: string,
        home: string,
        away: string
      }},
      startTime: string,
      sport: string,
      competitors: {
        HOME: {
          type: string,
          name: string
        },
        AWAY: {
          type: string,
          name: string
        }
      },
      competition: string
  }
}