import { useRef, useEffect } from 'react'

const globalEmitter = new EventTarget()

export function useEventEmitter() {
  const emitterRef = useRef(globalEmitter)

  const emit = (eventName: string, detail?: any) => {
    emitterRef.current.dispatchEvent(new CustomEvent(eventName, { detail }))
  }

  // handy helper for shopkeeper interactions
  const emitYap = (interaction: string) => {
    emitterRef.current.dispatchEvent(new CustomEvent('shopkeeper', { detail: { interaction } }))
  }

  const on = (eventName: string, callback: (event: CustomEvent) => void) => {
    emitterRef.current.addEventListener(eventName, callback as EventListener)
  }

  const off = (eventName: string, callback: (event: CustomEvent) => void) => {
    emitterRef.current.removeEventListener(eventName, callback as EventListener)
  }

  return { emit, on, off, emitYap }
}
