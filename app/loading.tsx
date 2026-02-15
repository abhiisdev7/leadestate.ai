import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader
        role="status"
        aria-label="Loading"
        className="size-4 text-primary animate-spin-slow"
      />
    </div>
  );
}
