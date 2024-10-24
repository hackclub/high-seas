import { AlertCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function SlackAuthErrorPage({
  searchParams,
}: {
  searchParams: { msg?: string };
}) {
  const { msg } = searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4A154B]">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <AlertCircle
          className="mx-auto h-12 w-12 text-red-500 mb-4"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-6">
          {msg || "An error occurred during Slack authentication."}
        </p>

        <Link className={buttonVariants({ variant: "outline" })} href="/">
          Enter the keep
        </Link>
      </div>
    </div>
  );
}
