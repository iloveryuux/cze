import { menu, input } from '@ryuux/prompt'
import { red, bgBrightRed } from '@ryuux/palette'
import { gitmoji } from './gitmoji'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const ERROR = {
  noGitRepo: '❌ A Git repository was not found in this directory.',
  noStagedChanges: `❌ There are no staged changes to confirm. Use ${bgBrightRed('git add')} ${red('to add files.')}`
}

function checkGitRepo() {
  if (!existsSync('.git')) {
    console.log(red(ERROR.noGitRepo))
    process.exit(1)
  }
}

function getStagedChanges() {
  const stagedChanges = execSync('git diff --cached --name-only')
    .toString()
    .trim()
  if (!stagedChanges) {
    console.log(red(ERROR.noStagedChanges))
    process.exit(1)
  }
  return stagedChanges
}

async function getCommitMessage() {
  const options = gitmoji.map(item => `${item.description} (${item.emoji})`)
  const selectedIndex = await menu(options)
  const selectedGitmoji = gitmoji[selectedIndex]
  const prefix = `${selectedGitmoji.emoji} ${selectedGitmoji.code}:`

  const description = await input('Enter a description: ')
  return `${prefix} ${description}`
}

function commitChanges(message: string) {
  execSync(`git commit -m "${message}"`)
}

async function main() {
  checkGitRepo()
  getStagedChanges()
  const commitMessage = await getCommitMessage()
  commitChanges(commitMessage)
}

main().catch(error => {
  console.error(red(`❌ An error occurred: ${error.message}`))
  process.exit(1)
})
