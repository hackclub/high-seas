import Pill from "./ui/pill";

const steps = [
  { name: "Hackatime", done: true },
  { name: "Ship", done: true },
  { name: "Vote", done: false },
  { name: "Prizes", done: false },
];

export default function Steps({}) {
  return (
    <div className="flex gap-2 items-center">
      {steps.map((step, idx) => (
        <div
          key={idx}
          className={`flex flex-col gap-1 items-center ${step.done ? "opacity-50" : null} ${idx === 4 ? "scale-50" : null}`}
        >
          <div
            className={`w-4 h-4 ${step.done ? "bg-gray-500" : "bg-[#48BBFE]"} rounded-full leading-none text-sm text-white flex items-center justify-center`}
          >
            <p className="m-0">{idx + 1}</p>
          </div>
          <Pill msg={step.name} color="gray"></Pill>
        </div>
      ))}
      <div className="rounded-full"></div>
    </div>
  );
}
