// Import necessary modules and components
import Link from "next/link";
import { createShip, Ship } from "./ship-utils";
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

export default function NewShipForm({
  ships,
  canvasRef,
  closeForm,
  session,
}: {
  ships: Ship[];
  canvasRef: any;
  closeForm: any;
  session: any;
}) {
  const confettiRef = useRef<JSConfetti | null>(null);
  const [projects, setProjects] = useState<{ key: string; total: number }[]>(
    [],
  );
  const [labels, setLabels] = useState<{ key: string; total: number }[]>(
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
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await getWakaSessions();
        const shippedShips = ships
          .map((s) => s.wakatimeProjectName)
          .filter((n) => n);
        setProjects(
          res.projects.filter(
            (p) => p.key != "<<LAST_PROJECT>>" && !shippedShips.includes(p.key),
          ),
        );

        // Set labels
        setLabels(
          res.labels.filter(
            (p) => p.key != "default" && !shippedShips.includes(p.key),
          ),
        );

        console.log(res);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
    fetchProjects();
  }, [session.payload.sub]);

  const handleForm = async (formData: FormData) => {
    // Append the selected project's hours to the form data
    if (selectedProject) {
      formData.set("wakatimeProjectName", selectedProject.key.toString());
    }

    await createShip(formData);
    confettiRef.current?.addConfetti();
    closeForm();
    window.location.reload();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {isShipUpdate ? "Update a" : "New"} Ship
      </h1>
      <form action={handleForm} className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isShipUpdate"
            id="isShipUpdate"
            onChange={({ target }) => setIsShipUpdate(target.checked)}
          />
          <label htmlFor="isShipUpdate" className="select-none">
            This is an update to an existing Ship
          </label>
        </div>

        <AnimatePresence>
          {isShipUpdate ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "fit-content", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <label htmlFor="updateDescription">
                Description of the update
              </label>
              <textarea
                id="updateDescription"
                name="updateDescription"
                rows={4}
                cols={50}
                minLength={10}
                required
                className="w-full p-2 border rounded"
              ></textarea>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Project Dropdown */}
        <div>
          <label htmlFor="project" className="leading-0">
            Select Project <br />
            <span className="text-xs opacity-50">
              If you need to include several of the listed projects in this
              dropdown, you need to update your project labels in the{" "}
              <a
                className="text-blue-600"
                href="https://waka.hackclub.com"
                target="_blank"
              >
                Wakatime dashboard
              </a>
            </span>
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedProject
                  ? `${selectedProject.key} (${(selectedProject.total / 60 / 60).toFixed(1)} hrs)`
                  : "Select project..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search projects..." />
                <CommandList>
                  <CommandEmpty>No WakaTime projects found 😭</CommandEmpty>
                  <CommandGroup>
                    <h3>Labels:</h3>
                    {labels.map((label, idx) => (
                      <CommandItem
                        key={`${label.key}-${idx}`}
                        value={(label.total / 60 / 60).toFixed(2)}
                        onSelect={() => {
                          setSelectedProject(label);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedProject &&
                              selectedProject.key === label.key
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {label.key} ({(label.total / 60 / 60).toFixed(1)}{" "}
                        hrs)
                     </CommandItem>
                    ))}
                    <hr />
                    <h3>Projects:</h3>
                    {projects.map((project, idx) => (
                      <CommandItem
                        key={`${project.key}-${idx}`}
                        onSelect={() => {
                          setSelectedProject(project);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedProject &&
                              selectedProject.key === project.key
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {project.key} ({(project.total / 60 / 60).toFixed(1)}{" "}
                        hrs)
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {/* Hidden input to include in formData */}
          {selectedProject && (
            <>
              <input
                type="hidden"
                name="hours"
                value={(selectedProject.total / 60 / 60).toFixed(3)}
              />
              <input
                type="hidden"
                name="wakatime_project_name"
                value={selectedProject.key}
              />
            </>
          )}
        </div>

        <div>
          <label htmlFor="repo_url">Repo URL</label>
          <input
            type="url"
            id="repo_url"
            name="repo_url"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="readme_url">README URL</label>
          <input
            type="url"
            id="readme_url"
            name="readme_url"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="deployment_url">Demo Link (Project / Video URL)</label>
          <input
            type="url"
            id="deployment_url"
            name="deployment_url"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="screenshot_url">
            Screenshot URL
            <br />
            <span className="text-xs opacity-50">
              You can upload to{" "}
              <Link
                className="text-blue-500"
                href="https://hackclub.slack.com/archives/C016DEDUL87"
                target="_blank"
                rel="noopener noreferrer"
              >
                #cdn
              </Link>{" "}
              if you like!
            </span>
          </label>
          <input
            type="url"
            id="screenshot_url"
            name="screenshot_url"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <Button type="submit" className="w-full">
          Stage my Ship!
        </Button>
      </form>
    </div>
  );
}
