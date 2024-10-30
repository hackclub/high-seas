import React, { useEffect, useState } from "react";
import { hasHb } from "@/app/utils/wakatime-setup/tutorial-utils";
import { waka } from "../waka";
import Platforms from "./platforms";
import Modal from "../../../components/ui/modal";

/**
 * Modal component that guides users through the Hackatime setup process.
 *
 * @component
 * @param props - Component props
 * @param props.isOpen - Controls the visibility state of the modal
 * @param props.close - Callback function to close the modal
 * @param props.onHbDetect - Optional callback that runs when Hackatime heartbeat data is detected.
 *                          If provided, the component will perform heartbeat checks.
 *                          If not provided, heartbeat checks are disabled.
 * @returns React component
 *
 * @example
 * ```tsx
 * <SetupModal
 *   isOpen={true}
 *   close={() => setIsOpen(false)}
 *   onHbDetect={() => {
 *     // Handle heartbeat detection
 *     processHeartbeatData();
 *     setIsOpen(false);
 *   }}
 * />
 * ```
 */
export default function SetupModal({
  isOpen,
  close,
  onHbDetect,
}: {
  isOpen: any;
  close: () => void;
  onHbDetect: (() => any) | undefined;
}) {
  const [wakaKey, setWakaKey] = useState<string>();
  const [hasRecvHb, setHasRecvHb] = useState<boolean>();

  useEffect(() => {
    (async () => {
      const { username, key } = await waka();
      setWakaKey(key);

      hbDetectLoop: while (onHbDetect) {
        const hasData = await hasHb(username, key);
        console.log("Hb check:", hasData);

        if (hasData) {
          onHbDetect();
          setHasRecvHb(true);
          break hbDetectLoop;
        }

        await new Promise((r) => setTimeout(r, 2_500));
      }
    })();
  }, []);

  return (
    <Modal isOpen={isOpen} close={close}>
      {wakaKey ? <Platforms wakaKey={wakaKey} /> : null}

      {onHbDetect ? (
        <p className="mt-4 text-lg">
          {hasRecvHb ? "Installed!" : "Waiting for install..."}
        </p>
      ) : null}
    </Modal>
  );
}
