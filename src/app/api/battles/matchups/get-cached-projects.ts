import { kv } from '@vercel/kv'
import { getAllProjects } from '../../../../../lib/battles/airtable'

// 1mb limit on each redis entry
const PROJECT_CHUNK_SIZE = 1400
const PROJECT_CACHE_TTL = 60 * 10

async function pullFromRedis() {
  const chunkCount = await kv.get('projects.size')

  if (!chunkCount) {
    return null
  }
  if (typeof chunkCount !== 'number') {
    return null
  }

  const chunks = await Promise.all(
    Array.from({ length: chunkCount }, (_, i) => kv.get(`projects.${i}`)),
  )
  return chunks.flat()
}
async function setToRedis(projectsArr: Ships[]) {
  console.log('Setting projects to Redis')
  const chunkCount = Math.ceil(projectsArr.length / PROJECT_CHUNK_SIZE)
  await kv.set('projects.size', chunkCount, { ex: PROJECT_CACHE_TTL })
  for (let i = 0; i < projectsArr.length; i += PROJECT_CHUNK_SIZE) {
    await kv.set(
      `projects.${i / PROJECT_CHUNK_SIZE}`,
      projectsArr.slice(i, i + PROJECT_CHUNK_SIZE),
      { ex: PROJECT_CACHE_TTL },
    )
  }
}

export async function tryUpdateProjectCache() {
  const chunkCount = await kv.get('projects.size')
  const currentlyCached = Boolean(chunkCount)
  const every2Minutes = new Date().getMinutes() % 2 === 0

  if (!currentlyCached || every2Minutes) {
    await updateProjectCache()
  }
}

export async function updateProjectCache() {
  const projects = await getAllProjects()
  await setToRedis(projects)
}

export async function getCachedProjects() {
  const alreadyCached = await pullFromRedis()
  if (alreadyCached) {
    return alreadyCached
  }
  const projects = await getAllProjects()
  await setToRedis(projects)
  return projects
}
