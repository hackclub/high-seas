'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, CircleStop } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export default function SpeechToText({
  handleResults,
}: {
  handleResults: (transcript: string) => void
}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')

  const [open, setOpen] = useState(false)

  const [supportsSpeechRecognition, setSupportsSpeechRecognition] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const ua = navigator?.userAgent || ''

    const hasSupport =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

    // unfortunately most chrome forks misreport support for this API
    const isArc = ua.includes('Arc')
    const isChromium = ua.includes('Chromium')
    const isBrave = navigator?.brave // good on brave for supporting this!

    // mobile keyboards already support STT, so we don't need to render in that case
    setSupportsSpeechRecognition(hasSupport && !isMobile && !isArc && !isChromium && !isBrave)
  }, [])

  const startListening = async () => {
    setTranscript('')

    await initLocalRecording()

    await recognitionRef.current.start()
    setIsListening(true)
  }

  const stopListening = () => {
    recognitionRef.current.stop()
    handleResults(transcript)
    setIsListening(false)
  }

  const initLocalRecording = async () => {
    if (!window) {
      return
    }
    const SpeechRecognition = window?.SpeechRecognition || window?.webkitSpeechRecognition
    if (!SpeechRecognition) {
      return
    }
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.interimResults = true

    recognitionRef.current.onresult = (event) => {
      for (const result of event.results) {
        setTranscript(result[0].transcript)
      }
    }

    recognitionRef.current.onerror = (event) => {
      console.error({ event })
      setIsListening(false)
    }

    recognitionRef.current.onend = (event) => {
      console.log({ end: event })
      setIsListening(false)
    }
  }

  if (supportsSpeechRecognition) {
    return (
      <>
        <Popover open={open}>
          <PopoverContent>
            {isListening ? 'Finish and paste' : 'Click to begin dictation'}
          </PopoverContent>
          <PopoverTrigger
            asChild
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <Button
              className="icon"
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? 'destructive' : 'default'}
            >
              {isListening ? <CircleStop className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </PopoverTrigger>
        </Popover>
      </>
    )
  } else {
    return null
  }
}
