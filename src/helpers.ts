import axios from "axios"
import { Match } from "./types/match.type"

export async function getMatchesData (mappedNameList) {
  const matchData = await (await axios.get('http://localhost:3000/api/state')).data

  const matchDataSplit = matchData.odds.split('\n')

  const matches: Match[] = []

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

    const transformedMatchData = {[matchData.id]: matchData}
   
    matches.push(transformedMatchData)

  })

  return matches
}

export function areMatchArrayIdsEqual(currentMatches: Match[], newMatches: Match[]) {
  const currentIds = currentMatches.map(item => Object.values(item)[0].id)
  const newIds = newMatches.map(item => Object.values(item)[0].id)
  
  for (let i = 0; i < currentMatches.length; i++) {
      if (JSON.stringify(currentIds[i]) !== JSON.stringify(newIds[i])) {
          return false;
      }
  }

  return true;
}


export function getIdsToChangeStatusToRemoved(currentMatches: Match[], newMatches: Match[]) {
  const currentIds = currentMatches.map(item => Object.values(item)[0].id)
  const newIds = newMatches.map(item => Object.values(item)[0].id)
  const idsToRemove: string[] = []
  currentIds.forEach(id => {
    if(!newIds.includes(id)) {
      idsToRemove.push(id)
    }
  })
  return idsToRemove
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