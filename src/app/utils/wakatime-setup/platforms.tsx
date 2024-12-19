import React, { useState, useEffect } from 'react'
import {
  SinglePlatform,
  osFromAgent,
  type Os,
} from '@/app/utils/wakatime-setup/tutorial-utils.client'
import { AnimatePresence, motion } from 'framer-motion'

export default function Platforms({
  wakaKey,
  hasHb,
  showInstructions,
  setShowInstructions,
}: {
  wakaKey: string
  hasHb: boolean
  showInstructions: boolean
  setShowInstructions: any
}) {
  const [showAllPlatforms, setShowAllPlatforms] = useState(false)
  const [userOs, setUserOs] = useState<Os>('unknown')

  useEffect(() => {
    const os = osFromAgent()
    setUserOs(os)
    setShowAllPlatforms(os === 'unknown')
  }, [])

  return (
    <>
      {showInstructions ? (
        <AnimatePresence mode="wait">
          {hasHb && (
            <p className="text-xs mt-4">
              <span
                className="underline cursor-pointer"
                onClick={() => setShowInstructions(false)}
              >
                Hide instructions
              </span>
            </p>
          )}
          {showAllPlatforms ? (
            <motion.div
              key={0}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'fit-content', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <SinglePlatform os={'windows'} wakaKey={wakaKey} />
              <hr className="my-8" />
              <SinglePlatform os={'macos'} wakaKey={wakaKey} />
              <hr className="my-8" />
              <SinglePlatform os={'linux'} wakaKey={wakaKey} />
              <hr className="my-8" />
              <SinglePlatform os={'chrome'} wakaKey={wakaKey} />
              <hr className="my-8" />
              <SinglePlatform os={'kicad'} wakaKey={wakaKey} />
              <hr className="my-8" />
              <p>
                Script not working? High Seas is wakatime-compatible, so you can
                configure wakatime plugins using the following:
              </p>
              <code className="block bg-gray-800 p-2 rounded-md mt-2">
                <pre>
                  {`# ~/.wakatime.cfg

[settings]
api_url = https://waka.hackclub.com/api
api_key = ${wakaKey}`}
                </pre>
              </code>
              <p
                className="text-xs mt-4 underline cursor-pointer"
                onClick={() => setShowAllPlatforms(false)}
              >
                Nevermind
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={1}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'fit-content', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <SinglePlatform os={userOs} wakaKey={wakaKey} />
              <h2 className="mt-6 text-xl">What exactly does the script do?</h2>
              <p className="mt-2">
                This script installs and configures Hackatime, our custom fork
                of a popular open-source coding time-tracker called Wakatime.
                First it tries to install the Wakatime extension for VS Code,
                and then it installs a configuration file that tells the
                extension to send your coding hours to the Hackatime server.
                <br></br>
                <br></br>
                If you don't use VS Code, run the script anyway and manually
                install the Wakatime extension for your editor. The
                configuration will apply automatically!
              </p>
              <video
                src={
                  userOs === 'windows'
                    ? '/videos/WakaSetupScriptWindows.mp4'
                    : userOs === 'macos'
                      ? '/videos/WakaSetupScriptMacOS.mp4'
                      : '/videos/WakaSetupScriptLinux.mp4'
                }
                autoPlay={true}
                muted={true}
                loop
                playsInline
                className="mt-8 rounded shadow"
              />
              <p className="text-xs mt-4">
                Not using {userOs}?{' '}
                <span
                  className="underline cursor-pointer"
                  onClick={() => setShowAllPlatforms(true)}
                >
                  View instructions for all platforms
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <p className="text-sm">
          <span
            className="underline cursor-pointer"
            onClick={() => setShowInstructions(true)}
          >
            {'> Show Hackatime install instructions'}
          </span>
        </p>
      )}
    </>
  )
}
