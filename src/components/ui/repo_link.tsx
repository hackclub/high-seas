import Link from 'next/link'
import Icon from '@hackclub/icons'
import { buttonVariants } from './button'

const RepoLink = ({ repo }: { repo: string }) => {
  if (!repo) return null
  let repoHost = 'Git Repo'
  let repoIcon = 'external'
  if (repo.includes('github.com')) {
    repoHost = 'GitHub Repo'
    repoIcon = 'github'
  } else if (repo.includes('gitlab.com')) {
    repoHost = 'GitLab Repo'
  } else if (repo.includes('codeberg')) {
    repoHost = 'Codeberg Repo'
  } else if (repo.includes('git.hackclub.app')) {
    // the HC hosted forgejo instance https://hackclub.slack.com/archives/C056WDR3MQR/p1732500961325289?thread_ts=1732500940.778049&cid=C056WDR3MQR
    repoHost = 'Nest Repo'
  }
  return (
    <Link
      id="selected-ship-repo-button"
      target="_blank"
      className={`${buttonVariants({
        variant: 'outline',
      })} h-full`}
      href={repo}
      prefetch={false}
    >
      <Icon glyph={repoIcon} /> {repoHost}
    </Link>
  )
}

export default RepoLink
