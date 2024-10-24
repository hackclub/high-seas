// Import necessary modules and components
import Link from "next/link";
import { createShip, createShipUpdate, Ship } from "./ship-utils";
import { Button } from "@/components/ui/button";
import JSConfetti from "js-confetti";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getWakaSessions } from "@/app/utils/waka";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@hackclub/icons";

export default function NewUpdateForm({
  shipToUpdate,
  canvasRef,
  closeForm,
  session,
}: {
  shipToUpdate: Ship;
  canvasRef: any;
  closeForm: any;
  session: any;
}) {
  const [staging, setStaging] = useState(false);
  const confettiRef = useRef<JSConfetti | null>(null);
  const [projects, setProjects] = useState<{ key: string; total: number }[]>(
    [],
  );
  const [selectedProject, setSelectedProject] = useState<{
    key: string;
    total: number;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [isShipUpdate, setIsShipUpdate] = useState(false);

  // Initialize confetti on mount
  useEffect(() => {
    confettiRef.current = new JSConfetti({ canvas: canvasRef.current });
  }, [canvasRef.current]);

  // Fetch projects from the API using the Slack ID
  // useEffect(() => {
  //   async function fetchProjects() {
  //     try {
  //       const slackId = session.payload.sub;
  //       const res = await getWakaSessions();
  //       const shippedShips = ships
  //         .filter((s) => s.shipStatus !== "deleted")
  //         .map((s) => s.wakatimeProjectName)
  //         .filter((n) => n);
  //       setProjects(
  //         res.projects.filter(
  //           (p) => p.key != "<<LAST_PROJECT>>" && !shippedShips.includes(p.key),
  //         ),
  //       );

  //       console.log(res);
  //     } catch (error) {
  //       console.error("Error fetching projects:", error);
  //     }
  //   }
  //   fetchProjects();
  // }, [session.payload.sub]);

  const handleForm = async (formData: FormData) => {
    setStaging(true);
    // // Append the selected project's hours to the form data
    // if (selectedProject) {
    //   formData.append("hours", selectedProject.key.toString());
    // }

    await createShipUpdate(shipToUpdate.id, formData);
    confettiRef.current?.addConfetti();
    closeForm();
    setStaging(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Ship an update to {shipToUpdate.title}
      </h1>
      <form action={handleForm} className="space-y-3">
        <label htmlFor="update_description">Description of the update</label>
        <textarea
          id="update_description"
          name="update_description"
          rows={4}
          cols={50}
          minLength={10}
          required
          className="w-full p-2 border rounded"
        ></textarea>

        <Button type="submit" className="w-full" disabled={staging}>
          {staging ? (
            <>
              <Icon glyph="more" />
              Staging!
            </>
          ) : (
            "Stage my Ship!"
          )}
        </Button>
      </form>
    </div>
  );
}
