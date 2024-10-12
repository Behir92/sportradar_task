//some example unit tests

import axios from 'axios'
import { describe, it, expect, afterEach, jest } from '@jest/globals'
import { Match } from '../src/types/match.type'
import { getMappings, updateMatchesInMemory } from '../src/helpers'
import { mockedAxios } from './mocks/axios.mock'

jest.mock('axios')

describe('getMappings', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch mappings and return an object', async () => {
    const apiResponse = {
      mappings: 'someId:CURRENT;teamA:Team A;teamB:Team B'
    }

    mockedAxios.get.mockResolvedValueOnce({ data: apiResponse })

    const result = await getMappings()

    expect(result).toEqual({
      someId: 'CURRENT',
      teamA: 'Team A',
      teamB: 'Team B',
    })
  })
})

describe('updateMatchesInMemory', () => {
  it('should update matches and set status to REMOVED if not found', () => {
    const matchesInMemory: Match = {
      '1': {
        id: '1',
        status: 'ACTIVE',
        scores: {
          CURRENT: {
            type: 'CURRENT',
            home: '1',
            away: '0',
          },
        },
        startTime: '2024-10-12T10:00:00Z',
        sport: 'Football',
        competitors: {
          HOME: {
            type: 'HOME',
            name: 'Team A',
          },
          AWAY: {
            type: 'AWAY',
            name: 'Team B',
          },
        },
        competition: 'League',
      },
    }

    const currentMatches: Match = {
      '2': {
        id: '2',
        status: 'ACTIVE',
        scores: {
          CURRENT: {
            type: 'CURRENT',
            home: '1',
            away: '0',
          },
        },
        startTime: '2024-10-12T12:00:00Z',
        sport: 'Football',
        competitors: {
          HOME: {
            type: 'HOME',
            name: 'Team C',
          },
          AWAY: {
            type: 'AWAY',
            name: 'Team D',
          },
        },
        competition: 'League',
      },
    }

    updateMatchesInMemory(matchesInMemory, currentMatches)

    expect(matchesInMemory['1'].status).toBe('REMOVED')
    expect(matchesInMemory['2']).toEqual(currentMatches['2'])
  })

  it('should update existing matches when they change', () => {
    const matchesInMemory: Match = {
      '1': {
        id: '1',
        status: 'ACTIVE',
        scores: {
          CURRENT: {
            type: 'CURRENT',
            home: '1',
            away: '0',
          },
        },
        startTime: '2024-10-12T10:00:00Z',
        sport: 'Football',
        competitors: {
          HOME: {
            type: 'HOME',
            name: 'Team A',
          },
          AWAY: {
            type: 'AWAY',
            name: 'Team B',
          },
        },
        competition: 'League',
      },
    }

    const currentMatches: Match = {
      '1': {
        id: '1',
        status: 'ACTIVE',
        scores: {
          CURRENT: {
            type: 'CURRENT',
            home: '1',
            away: '0',
          },
        },
        startTime: '2024-10-12T11:00:00Z',
        sport: 'Football',
        competitors: {
          HOME: {
            type: 'HOME',
            name: 'Team A',
          },
          AWAY: {
            type: 'AWAY',
            name: 'Team B',
          },
        },
        competition: 'League',
      },
    }

    updateMatchesInMemory(matchesInMemory, currentMatches)

    expect(matchesInMemory['1'].startTime).toBe('2024-10-12T11:00:00Z')
  })

  it('should add new matches from currentMatches', () => {
    const matchesInMemory: Match = {}

    const currentMatches: Match = {
      '1': {
        id: '1',
        status: 'ACTIVE',
        scores: {
          CURRENT: {
            type: 'CURRENT',
            home: '1',
            away: '0',
          },
        },
        startTime: '2024-10-12T10:00:00Z',
        sport: 'Football',
        competitors: {
          HOME: {
            type: 'HOME',
            name: 'Team A',
          },
          AWAY: {
            type: 'AWAY',
            name: 'Team B',
          },
        },
        competition: 'League',
      },
    }

    updateMatchesInMemory(matchesInMemory, currentMatches)

    expect(matchesInMemory['1']).toEqual(currentMatches['1'])
  })
})