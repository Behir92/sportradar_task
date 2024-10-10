import { areMatchArrayIdsEqual } from "../src/helpers"
import { Match } from "../src/types/match.type"
import { describe, expect, it } from 'vitest';

describe('Example of a unit tests for one of the helper functions', () => {
  
  it('[areMatchArrayIdsEqual] should false if the ids are not equal', async () => {
    const list1 = [{'abc': {"id": "abc"}}, {'def': {"id": "def"}}]
    const list2 = [{'abc': {"id": "abc"}}, {'xyz': {"id": "xyz"}}]

    const result = areMatchArrayIdsEqual(list1 as unknown as Match[], list2 as unknown as Match[])
    expect(result).toEqual(false)
  })
})