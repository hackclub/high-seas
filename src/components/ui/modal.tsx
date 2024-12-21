import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@hackclub/icons'
import JaggedCard from '../jagged-card'
import { createPortal } from 'react-dom'

export default function Modal({
  isOpen,
  close,
  hideCloseButton = false,
  children,
  ...props
}: {
  isOpen: boolean
  close: (_: any) => void
  hideCloseButton?: boolean
  children: React.ReactNode
  props?: any
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !hideCloseButton) {
        close(event)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [hideCloseButton, close])

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          {createPortal(
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0)' }}
              style={{
                willChange: 'filter, transform',
                position: 'fixed',
              }}
              className="absolute inset-0 w-full"
              onClick={close}
              {...props}
            >
              <div
                className="inset-0 w-full h-full bg-black/50 overflow-hidden"
                style={{ position: 'fixed' }}
              />

              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 1.1 }}
                className="max-w-3xl mx-auto"
              >
                <JaggedCard
                  className="w-full text-left text-white relative mx-auto mt-20"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  {hideCloseButton ? null : (
                    <motion.button
                      className="absolute top-2 right-2 p-1 rounded-full bg-blues shadow-md z-20 bg-opacity-30"
                      style={{
                        maskImage:
                          'radial-gradient(circle, rgb(0, 0, 0) 0%, rgba(255,255,255,0) 100%)',
                        WebkitMaskImage:
                          'radial-gradient(circle, rgb(0, 0, 0) 0%, rgba(255,255,255,0) 100%)',
                      }}
                      onClick={close}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon glyph="view-close" />
                    </motion.button>
                  )}
                  {children}
                </JaggedCard>
              </motion.div>
            </motion.div>,
            document.body,
          )}
        </>
      ) : null}
    </AnimatePresence>
  )
}
