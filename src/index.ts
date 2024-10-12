//I liked the task and wanted to devote a little more time to it to eliminate the issues
//Introduced a cron to move the logic behind refreshing the data from the endpoint and make it server-dependent instead of initiated by each new connection

import express from 'express'
import dotenv from 'dotenv'
import { getMappings, getMatchesData, updateMatchesInMemory } from './helpers'
import cron from 'node-cron'
import { Match } from './types/match.type'

dotenv.config()

let idToName
let currentMatches: Match
let matchesInMemory: Match

initiate()

cron.schedule('*/5 * * * * *', async () => {
  idToName = await getMappings()
  currentMatches = await getMatchesData(idToName)
  updateMatchesInMemory(matchesInMemory, currentMatches)
});

const app = express()

const port = process.env.PORT || 9000;



app.get('/state', async (req, res) => {

  res.json({ data: matchesInMemory })

});


app.listen(port, () => {
  console.log(`Server is available at http://localhost:${port}`)
})

async function getInitialData() {
 idToName = await getMappings()
 matchesInMemory = await getMatchesData(idToName)
 matchesInMemory = removeDuplicateMatches(matchesInMemory)
}

async function initiate() {
  const maxAttempts = 15
  const interval = 1000

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await getInitialData();
      break
    } catch (error) {
      console.log(`Attempt ${attempt + 1} unsuccessful. Retrying...`)
      if (attempt === maxAttempts - 1) {
        console.error('Maximal attempts reached. Initialization failed.')
      }
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }
}

function removeDuplicateMatches(matches: Match): Match {
  const uniqueMatches = new Map<string, typeof matches[string]>()

  for (const key in matches) {
    if (matches.hasOwnProperty(key)) {
      const match = matches[key];
      if (!uniqueMatches.has(match.id)) {
        uniqueMatches.set(match.id, match)
      }
    }
  }

  return Object.fromEntries(uniqueMatches.entries()) as Match
}