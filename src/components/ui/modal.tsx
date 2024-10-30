import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@hackclub/icons";
import JaggedCard from "../jagged-card";
import { createPortal } from "react-dom";

export default function Modal({
  isOpen,
  close,
  hideCloseButton = false,
  children,
  ...props
}: {
  isOpen: boolean;
  close: (_: any) => void;
  hideCloseButton?: boolean;
  children: React.ReactNode;
  props?: any;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          {createPortal(
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0)" }}
              animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0)" }}
              style={{ willChange: "filter, transform" }}
              className="absolute inset-0 w-full"
              onClick={close}
              {...props}
            >
              <div className="absolute inset-0 w-full h-full bg-black/50 " />

              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 1.1 }}
              >
                <JaggedCard
                  className="w-full max-w-3xl text-left text-white relative mx-auto mt-20"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  {hideCloseButton ? null : (
                    <div
                      id="modal-close-button"
                      className="absolute top-4 right-4 cursor-pointer p-4 sm:p-6"
                      onClick={close}
                    >
                      <Icon glyph="view-close" />
                    </div>
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
  );
}
