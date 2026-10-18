import React, { useEffect } from 'react'
import Platforms from './platforms'
import Modal from '../../../components/ui/modal'
import { fetchWaka } from '../server/data'
import useLocalStorageState from '../../../../lib/useLocalStorageState'

function SetupModal({
  isOpen,
  close,
  onHbDetect,
}: {
  isOpen: boolean
  close: () => void
  onHbDetect?: () => void
}) {
  const [wakaKey, setWakaKey] = useLocalStorageState('cache.wakaKey', '')
  const [hasHb, setHasHb] = useLocalStorageState('cache.hasHb', false)
  const [wakaUsername, setWakaUsername] = useLocalStorageState('cache.wakaUsername', '')

  useEffect(() => {
    fetchWaka().then(({ key, hasHb, username }) => {
      setWakaKey(key)
      setHasHb(hasHb)
      setWakaUsername(username)
    })

    let mounted = true
    let timeoutId: number

    async function checkHeartbeat() {
      if (!onHbDetect || !mounted || hasHb) return

      if (hasHb && mounted) {
        console.log('Heartbeat data detected')
        onHbDetect()
        hasHb(true)
      } else if (mounted) {
        timeoutId = window.setTimeout(checkHeartbeat, 5000)
      }
    }

    checkHeartbeat()
    return () => {
      mounted = false
      window.clearTimeout(timeoutId)
    }
  }, [])

  return (
    <Modal isOpen={isOpen} close={close}>
      {wakaKey && <Platforms wakaKey={wakaKey} />}
      {onHbDetect && (
        <p className="mt-4 text-lg">{hasHb ? 'Installed!' : 'Waiting for install...'}</p>
      )}
    </Modal>
  )
}

export default SetupModal
