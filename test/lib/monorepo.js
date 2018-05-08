const dbs = require('../../lib/dbs')
// const {
//   isPartOfMonorepo,
//   hasAllMonorepoUdates,
//   getMonorepoGroup } = require('../../lib/monorepo')
// await npm.put({
//   _id: '49',
//   accountId: '123',
//   fullName: 'finnp/test'
// })

const {
  getMonorepoGroup,
  isPartOfMonorepo
} = require('../../lib/monorepo')

describe('lib monorepo', async () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('isPartOfMonorepo true', () => {
    jest.mock('../../lib/monorepo', () => {
      const lib = require.requireActual('../../lib/monorepo')
      lib.getMonorepoGroup = (dep) => {
        return 'fruits'
      }
      return lib
    })

    const libMonorepo = require.requireMock('../../lib/monorepo')
    const isPartOfMonorepo = libMonorepo.isPartOfMonorepo('@avocado/dep')
    expect(isPartOfMonorepo).toBeTruthy()
  })

  test('isPartOfMonorepo false', () => {
    const result = isPartOfMonorepo('some-dep')
    expect(result).toBeFalsy()
  })

  test('hasAllMonorepoUdates true', async () => {
    const { npm } = await dbs()
    await npm.put({
      _id: '@avocado/dep',
      distTags: {
        latest: '2.0.0'
      }
    })

    await npm.put({
      _id: '@banana/dep',
      distTags: {
        latest: '2.0.0'
      }
    })

    jest.mock('../../lib/monorepo', () => {
      const lib = require.requireActual('../../lib/monorepo')
      lib.getMonorepoGroup = (dep) => {
        return 'fruits'
      }
      lib.monorepoDefinitions = { 'fruits': ['@avocado/dep', '@banana/dep'] }
      return lib
    })

    const libMonorepo = require.requireMock('../../lib/monorepo')
    const result = await libMonorepo.hasAllMonorepoUdates('@avocado/dep', '2.0.0')
    expect(result).toBeTruthy()
  })

  test('hasAllMonorepoUdates false', async () => {
    const { npm } = await dbs()
    await npm.put({
      _id: 'berlin',
      distTags: {
        latest: '2.0.0'
      }
    })

    await npm.put({
      _id: 'hamburg',
      distTags: {
        latest: '1.0.0'
      }
    })

    jest.mock('../../lib/monorepo', () => {
      const lib = require.requireActual('../../lib/monorepo')
      lib.getMonorepoGroup = (dep) => {
        return 'cities'
      }
      lib.monorepoDefinitions = { 'cities': ['berlin', 'hamburg'] }
      return lib
    })

    const libMonorepo = require.requireMock('../../lib/monorepo')
    const result = await libMonorepo.hasAllMonorepoUdates('berlin', '2.0.0')
    expect(result).toBeFalsy()
  })

  test('getMonorepoGroup', () => {
    const result = getMonorepoGroup('pouchdb-md5')
    expect(result).toBe('pouchdb')
  })
})
