import axios from "axios"
import { Match } from "./types/match.type"

export async function getMatchesData (mappedNameList): Promise<Match> {
  const matchData = await (await axios.get('http://localhost:3000/api/state')).data

  const matchDataSplit = matchData.odds.split('\n')

  const matches: Match = {}

  matchDataSplit.forEach(match => {
    const matchSplit = match.split(',')

    let scores = matchSplit[7].split('\|')

    let currentScore

    scores.forEach(score => {
      const scoreSplit = score.split('@')
      const actualScore = scoreSplit[1].split(':')
      if (scoreSplit[0] in mappedNameList && mappedNameList[scoreSplit[0]] == 'CURRENT') {
        currentScore = {CURRENT: {
          type: mappedNameList[scoreSplit[0]],
          home: actualScore[0],
          away: actualScore[1]
        }}
      }
      
    })

    const matchData = {
      id: matchSplit[0],
      status: mappedNameList[matchSplit[6]],
      scores: currentScore,
      startTime: new Date(Number(matchSplit[3])).toISOString(),
      sport: mappedNameList[matchSplit[1]],
      competitors: {
        HOME: {
          type: 'HOME',
          name: mappedNameList[matchSplit[4]]
        },
        AWAY: {
          type: 'AWAY',
          name: mappedNameList[matchSplit[5]]
        }
      },
      competition: mappedNameList[matchSplit[2]]
    }

    matches[matchData.id] = matchData
  })

  return matches
}


export async function getMappings() {
  const map = await (await axios.get('http://localhost:3000/api/mappings')).data

  const pairs = map.mappings.split(';')

  const idToName = {}

    pairs.forEach(pair => {
    const [key, value] = pair.split(':')
    idToName[key] = value
  })

  return idToName

}

export function updateMatchesInMemory (matchesInMemory: Match, currentMatches: Match) {

  const currentMatchesMap = new Map<string, any>(Object.entries(currentMatches))

  for (const key in matchesInMemory) {
    if (matchesInMemory.hasOwnProperty(key)) {
      const oldMatch = matchesInMemory[key]
      
      const newMatch = currentMatchesMap.get(oldMatch.id);

      if (newMatch) {
        if (JSON.stringify(oldMatch) !== JSON.stringify(newMatch)) {
          Object.assign(oldMatch, newMatch)
        }
      } else {
        oldMatch.status = 'REMOVED'
      }
    }
  }

  for (const key in currentMatches) {
    if (currentMatches.hasOwnProperty(key)) {
      const newMatch = currentMatches[key]

      const exists = matchesInMemory.hasOwnProperty(key)
      if (!exists) {
        matchesInMemory[key] = newMatch
      }
    }
  }
}
