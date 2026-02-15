import { GithubIcon, LinkedinIcon } from "lucide-react";
import Link from "next/link";

export function DeveloperSignature() {
  return (
    <footer className="absolute right-8 bottom-8 flex flex-col gap-2 bg-background p-2 rounded-lg font-heading">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Abhilash M</span>
        <Link
          href="https://github.com/abhiisdev7"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          aria-label="GitHub"
        >
          <GithubIcon className="size-4" />
        </Link>
        <Link
          href="https://www.linkedin.com/in/madi-abhilash/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          aria-label="LinkedIn"
        >
          <LinkedinIcon className="size-4" />
        </Link>
      </div>
      <Link href="https://hackathon.piazza360.ai/" className="text-xs text-muted-foreground/90 tracking-wide flex gap-2 leading-2">
        Built with <span aria-hidden className="-mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 40 40"><g fill="none" strokeMiterlimit={10}><path fill="#ff52a1" stroke="#231f20" d="M27.8 2.7A12.16 12.16 0 0 0 20 5.11a12.16 12.16 0 0 0-7.8-2.41C4.4 2.7.5 7.38.5 14.4c0 10.79 10 18.27 17.62 22.42a3.92 3.92 0 0 0 3.76 0C29.55 32.67 39.5 25.19 39.5 14.4c0-7.02-3.9-11.7-11.7-11.7Z" strokeWidth={1}></path><path stroke="#fff" strokeLinecap="round" d="M28.36 6.71c4.38-.46 5.91 2 6.54 3.76" strokeWidth={1}></path></g></svg>
        </span> in PCG Hackathon
      </Link>
    </footer>
  );
}