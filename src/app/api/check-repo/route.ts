import { NextResponse } from 'next/server'

async function fetchAllBranches(owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`)
  const branches = await response.json()
  return branches.map((branch: any) => branch.name)
}

async function fetchAllFiles(owner: string, repo: string, branch: string, path: string = ''): Promise<any[]> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`)
  const contents = await response.json()

  let files: any[] = []
  for (const item of contents) {
    if (item.type === 'file') {
      files.push(item)
    } else if (item.type === 'dir') {
      const subDirFiles = await fetchAllFiles(owner, repo, branch, item.path)
      files = files.concat(subDirFiles)
    }
  }
  return files
}

export async function POST(request: Request) {
  const { repoUrl } = await request.json()

  const repoMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!repoMatch) {
    return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 })
  }

  const [_, owner, repo] = repoMatch

  try {
    const branches = await fetchAllBranches(owner, repo)
    let allFiles: any[] = []

    for (const branch of branches) {
      const branchFiles = await fetchAllFiles(owner, repo, branch)
      allFiles = allFiles.concat(branchFiles)
    }

    const hasWebsiteFiles = allFiles.some((file) =>
      ['index.html', 'index.htm', 'index.php', 'index.asp', 'index.css'].includes(file.name),
    )

    return NextResponse.json({ hasWebsiteFiles })
  } catch (error) {
    console.error('Error fetching repository contents:', error)
    return NextResponse.json({ error: 'Failed to fetch repository contents' }, { status: 500 })
  }
}
