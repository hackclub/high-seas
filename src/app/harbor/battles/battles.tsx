'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Ships } from '../../../../types/battles/airtable'
import Icon from '@hackclub/icons'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

import { LoadingSpinner } from '../../../components/ui/loading_spinner.js'
import {
  getVotesRemainingForNextPendingShip,
  safePerson,
} from '@/app/utils/airtable'
import useLocalStorageState from '../../../../lib/useLocalStorageState'
import { useToast } from '@/hooks/use-toast'
import { HsSession } from '@/app/utils/auth'

import SpeechToText from '@/components/speech-to-text'
import Blessed from './blessed'
import Cursed from './cursed'
import pluralize from '../../../../lib/pluralize'
import ProjectCard from './project-card'
import { markdownComponents } from './mdc'
import { Ship } from '@/app/utils/data'
import Modal from '@/components/ui/modal'
import { sendFraudReport } from './fraud-utils'
import { Button } from '@/components/ui/button'

interface Matchup {
  project1: Ships
  project2: Ships
  signature: string
  ts: number
}

export default function Matchups({ session }: { session: HsSession }) {
  const [matchup, setMatchup] = useState<Matchup | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Ships | null>(null)
  const [reason, setReason] = useState('')
  const [fewerThanTenWords, setFewerThanTenWords] = useState(true)
  const [error, setError] = useState('')
  const [readmeContent, setReadmeContent] = useState('')
  const [isReadmeView, setIsReadmeView] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cursed, setCursed] = useState(false)
  const [blessed, setBlessed] = useState(false)

  const [fraudProject, setFraudProject] = useState<Ship>()
  const [fraudType, setFraudType] = useState<string>()
  const [fraudReason, setFraudReason] = useState<string>()
  const debounceTimeoutRef = useRef<number | null>(null)

  const { toast } = useToast()

  const [voteBalance, setVoteBalance] = useLocalStorageState(
    'cache.voteBalance',
    0,
  )

  const [skipsBeforeVote, setSkipsBeforeVote] = useLocalStorageState(
    'battles.skipsBeforeVote',
    0,
  )

  const [isFirstLoad, setIsFirstLoad] = useLocalStorageState(
    'battles.isFirstLoad',
    true,
  )

  const [analyticsState, setAnalyticsState] = useState({
    projectResources: {} as Record<
      string,
      {
        readmeOpened: boolean
        repoOpened: boolean
        demoOpened: boolean
      }
    >,
    matchupGeneratedAt: new Date(),
  })

  useEffect(() => {
    safePerson().then((sp) => {
      setCursed(sp.cursed)
      setBlessed(sp.blessed)
    })
  }, [])

  const unloader = () => !!selectedProject || !!fraudProject
  useEffect(() => {
    window.addEventListener('beforeunload', unloader)
    return () => window.removeEventListener('beforeunload', unloader)
  })

  useEffect(() => {
    setFewerThanTenWords(reason.trim().split(' ').length < 10)
  }, [reason])

  function onFraudClick(project: Ship) {
    setFraudProject(project)
    console.log(project)
  }

  // useEffect(() => {
  //   if (turnstileRef.current) {
  //     let widgetId;

  //     const genToken = () => {
  //       widgetId = window.turnstile!.render(turnstileRef.current, {
  //         sitekey: "0x4AAAAAAAzOAaBz1TUgJG68", // Site key
  //         theme: "dark",
  //         callback: (token: string) => {
  //           console.log(token);
  //           setTurnstileToken(token);
  //         },
  //       });
  //     };
  //     genToken();

  //     const genTokenInterval = setInterval(genToken, 4 * 60 * 1_000); // Every 4 minutes

  //     return () => {
  //       window.turnstile!.reset(widgetId);
  //       clearInterval(genTokenInterval);
  //     };
  //   }
  // }, [selectedProject]);

  const fetchVoteBalance = async () => {
    setVoteBalance(await getVotesRemainingForNextPendingShip(session.slackId))
  }

  const fetchMatchup = async (
    { retryTimeout }: { retryTimeout: number } = { retryTimeout: 4000 },
  ) => {
    setLoading(true)
    try {
      // require at least 1.25 seconds of loading time for full loop of loading animations
      const [response, _] = await Promise.all([
        fetch(
          '/api/battles/matchups' +
            (sessionStorage.getItem('tutorial') === 'true'
              ? '?tutorial=true'
              : ''),
        ),
        new Promise((r) => setTimeout(r, 1250)),
      ])
      if (response.ok) {
        const data: Matchup = await response.json()
        setAnalyticsState({
          matchupGeneratedAt: new Date(),
          projectResources: {
            [data.project1.id]: {
              readmeOpened: false,
              repoOpened: false,
              demoOpened: false,
            },
            [data.project2.id]: {
              readmeOpened: false,
              repoOpened: false,
              demoOpened: false,
            },
          },
        })
        const firstLoad = JSON.parse(
          localStorage.getItem('battles.isFirstLoad') || 'true',
        ).value

        if (!firstLoad) {
          setSkipsBeforeVote((prev) => prev + 1)
        } else {
          setIsFirstLoad(false)
        }

        setMatchup(data)
      } else {
        console.error('Failed to fetch matchup')
        toast({
          title: 'There are no ships to battle right now.',
          description: 'Searching again automatically',
        })
        setTimeout(
          () =>
            fetchMatchup({
              retryTimeout: Math.min(1000 * 60 * 5, retryTimeout * 2),
            }),
          retryTimeout,
        )
      }
    } catch (error) {
      console.error('Error fetching matchup:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatchup()
    fetchVoteBalance()
  }, [])

  const handleAudioTranscription = (transcript: string) => {
    setReason(reason + transcript)
  }

  const handleVoteClick = (project: Ships) => {
    setSelectedProject(project)

    if (sessionStorage.getItem('tutorial') === 'true') {
      setReason(
        "I really love the simple art style and I think overall it's a highly creative project, even though the other one might be a bit more technical!",
      )
    } else {
      setReason('')
    }

    setError('')
  }

  const handleVoteSubmit = async () => {
    if (fewerThanTenWords) {
      setError('Please provide a reason with at least 10 words.')
      return
    }

    if (sessionStorage.getItem('tutorial') === 'true') {
      setSelectedProject(null)
      setReason('')
      fetchMatchup()
      fetchVoteBalance()
      setIsSubmitting(false)
      return
    }

    if (selectedProject && matchup && session) {
      setIsSubmitting(true)
      try {
        const slackId = session.slackId
        const winner = selectedProject
        const loser =
          selectedProject.id === matchup.project1.id
            ? matchup.project2
            : matchup.project1

        const response = await fetch('/api/battles/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signature: matchup.signature,
            ts: matchup.ts,
            project1: matchup.project1,
            project2: matchup.project2,
            slackId,
            explanation: reason,
            winner: winner.id,
            loser: loser.id,
            winnerRating: winner.rating,
            loserRating: loser.rating,
            // turnstileToken,
            analytics: {
              ...analyticsState,
              skipsBeforeVote,
            },
          }),
        })

        if (response.ok) {
          setAnalyticsState({
            projectResources: {},
            matchupGeneratedAt: new Date(),
          })
          setSkipsBeforeVote(0)
          setIsFirstLoad(true)

          // const json = await response.json();
          // if (json.reload) {
          //   window.location.reload();
          //   return;
          // }

          setSelectedProject(null)
          setReason('')
          fetchMatchup()
          fetchVoteBalance()
        } else {
          const errorData = await response.json()
          setError(`Failed to submit vote: ${errorData.error}`)
        }
      } catch (error) {
        console.error('Error submitting vote:', error)
        setError(
          'An error occurred while submitting your vote. Please try again.',
        )
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleReadmeClick = async (project: Ships) => {
    try {
      const response = await fetch(project.readme_url)
      const content = await response.text()
      setReadmeContent(content)
      setIsReadmeView(true)
    } catch (error) {
      console.error('Error fetching README:', error)
    }
  }

  const handleFraudReport = useCallback(async () => {
    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current)
    }

    if (!fraudProject || !fraudReason || !fraudType) return

    debounceTimeoutRef.current = window.setTimeout(async () => {
      try {
        await sendFraudReport(fraudProject, fraudType, fraudReason)
      } catch (error) {
        console.error('Failed to flag project:', error)
      }

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }
    }, 300)

    setFraudProject(undefined)
    setFraudReason('')
    setFraudType('')
  }, [fraudProject, fraudType, fraudReason])

  if (isReadmeView) {
    return (
      <div className="min-h-[75vh] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-black dark:text-white">
          <button
            onClick={() => setIsReadmeView(false)}
            className="mb-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <Icon glyph="view-back" size={24} /> Back to Matchup
          </button>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {readmeContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[75vh] p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center text-white mb-12">
          <h1 className="font-heading text-5xl mb-6 text-center relative w-fit mx-auto">
            Battle!
          </h1>
          <p className="text-xl text-gray-300 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
            A good ship is technical, creative, and presented well so that
            others can understand and experience it. By that definition, which
            of these two projects is better? (If you are not sure, just refresh
            to skip!)
          </p>

          {blessed && <Blessed />}
          {cursed && <Cursed />}

          {voteBalance > 0 && (
            <div className="flex justify-center items-center space-x-4">
              {voteBalance} more {pluralize(voteBalance, 'vote', false)} until
              your next ship's payout!
            </div>
          )}
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : !matchup ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-6">
              No matchup available
            </p>
            <button
              onClick={fetchMatchup}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-8 items-stretch mb-12">
              <div id="voting-project-left" className="md:col-span-3">
                <ProjectCard
                  project={matchup.project1}
                  onVote={() => handleVoteClick(matchup.project1)}
                  onReadmeClick={() => handleReadmeClick(matchup.project1)}
                  setAnalyticsState={setAnalyticsState}
                  onFraudClick={onFraudClick}
                />
              </div>
              <div className="flex items-center justify-center text-6xl font-bold text-indigo-600 dark:text-indigo-300">
                VS
              </div>
              <div id="voting-project-right" className="md:col-span-3">
                <ProjectCard
                  project={matchup.project2}
                  onVote={() => handleVoteClick(matchup.project2)}
                  onReadmeClick={() => handleReadmeClick(matchup.project2)}
                  setAnalyticsState={setAnalyticsState}
                  onFraudClick={onFraudClick}
                />
              </div>

              <Modal
                isOpen={!!fraudProject}
                close={() => setFraudProject(undefined)}
              >
                <h3 className="text-2xl font-bold">
                  Why are you flagging {fraudProject?.title}?
                </h3>
                <select
                  value={fraudType}
                  onChange={(e) => setFraudType(e.target.value)}
                  className="w-full my-4 p-1 text-black"
                >
                  <option value="">Select the reason for flagging</option>
                  <option value="Incomplete README">Incomplete README</option>
                  <option value="No screenshot">No screenshot</option>
                  <option value="No demo link">No demo link</option>
                  <option value="Suspected fraud">Suspected fraud</option>
                  <option value="Wrong repo">
                    Repo not found / not open source
                  </option>
                </select>

                <AnimatePresence>
                  {fraudType === 'Incomplete README' ||
                  fraudType === 'No demo link' ||
                  fraudType === 'No screenshot' ||
                  fraudType === 'Wrong repo' ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'fit-content', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <p className="mb-3">
                        The creator of this project will be notified. Thanks for
                        making High Seas better! :)
                      </p>
                    </motion.div>
                  ) : null}

                  {fraudType === 'Suspected fraud' ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'fit-content', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <p className="mb-3">
                        The creator of this project will not know you reported
                        them. <b>Only the High Seas team will see this.</b>
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <textarea
                  value={fraudReason}
                  onChange={(e) => setFraudReason(e.target.value)}
                  placeholder="Provide your reason here"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md mb-4 text-gray-900 dark:text-white bg-white dark:bg-gray-700 min-h-[150px]"
                  rows={6}
                />

                <Button
                  variant={'destructive'}
                  disabled={!fraudType || !fraudReason}
                  onClick={handleFraudReport}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Flag project
                </Button>
              </Modal>
            </div>
            {/* <div ref={turnstileRef} className="mb-4"></div> */}
            {selectedProject && (
              <div
                id="voting-reason-container-parent"
                className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div id="voting-reason-container">
                  <h3 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                    Why are you voting for {selectedProject.title} over the
                    other?
                  </h3>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide your reason here (minimum 10 words)"
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md mb-4 text-gray-900 dark:text-white bg-white dark:bg-gray-700 min-h-[150px]"
                    rows={6}
                  />

                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}
                </div>

                <button
                  id="submit-vote"
                  onClick={handleVoteSubmit}
                  disabled={isSubmitting || fewerThanTenWords}
                  className={`bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 mr-3 rounded-lg transition-colors duration-200 text-lg w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {fewerThanTenWords ? (
                    reason.trim() ? (
                      `${10 - reason.trim().split(' ').length} words left...`
                    ) : (
                      '10 words left...'
                    )
                  ) : isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Vote'
                  )}
                </button>
                <SpeechToText handleResults={handleAudioTranscription} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
