//I had to take a dinner break, while working on this task. I have never written a continuous crawler before (only crawling scripts).
//Even though the app crashes during state reload, I decided to send it today.
//On demand I can put more time into the interval/timeout conundrum that causes the crashes, but it behaves correctly during the lifetime of a simulation by updating the matches and changing the status if they are no longer shown

import express from 'express'
import dotenv from 'dotenv'
import { areMatchArrayIdsEqual, getIdsToChangeStatusToRemoved, getMappings, getMatchesData } from './helpers'
import { Match } from './types/match.type'

dotenv.config()

const app = express()

const port = process.env.PORT || 9000;

let removedMatches: Match[] = []


app.get('/state', async (req, res) => {
  let idToName = await getMappings()

  let currentMatches
  let newMatches

  try {
      currentMatches = await getMatchesData(idToName)
    } catch(error) {
      setTimeout(async () => {
        idToName = await getMappings()
        currentMatches = await getMatchesData(idToName)
      }, 5000)
    }

  try {
      newMatches = await getMatchesData(idToName)
    } catch(error) {
      setTimeout(async () => {
        idToName = await getMappings()
        newMatches = await getMatchesData(idToName)
      }, 5000)
    }

  setInterval(async () => {
    idToName = await getMappings()

    try {
      newMatches = await getMatchesData(idToName)
    } catch(error) {
      setTimeout(async () => {
        //the app dies when the data-server has no data, as it gets pinged, but there is nothing to be split
        //would require more work on timeouts and intervals
        idToName = await getMappings()
        newMatches = await getMatchesData(idToName)
      }, 10000)
    }

    let areIdsEqual = areMatchArrayIdsEqual(currentMatches, newMatches)

    if (!areIdsEqual) {
      const matchesToRemove = getIdsToChangeStatusToRemoved(currentMatches, newMatches)

      for (const match of currentMatches) {
        const key = Object.keys(match)[0]
        if (matchesToRemove.includes(match[key].id)) {
          match[key].status = 'REMOVED'
          removedMatches.push(match)
        }
      }
    }

    currentMatches = newMatches

  }, 5000);

  res.json({ data: [...removedMatches, ...newMatches] })

});


app.listen(port, () => {
  console.log(`Server is available at http://localhost:${port}`);
})
