import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-sm font-semibold tracking-wide">
          Checkout Optimizer
        </span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-200 hover:bg-zinc-800">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-300">
          D2C growth engine
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight">
          Recover checkout revenue before shoppers leave
        </h1>
        <p className="mt-6 text-lg text-zinc-400">
          Inject margin-safe offers at exit-intent and idle moments. Track AOV
          lift, recovered revenue, and conversion impact in real time.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/dashboard">
            <Button className="px-8 py-3 text-base">Open dashboard</Button>
          </Link>
          <Link href="/test-checkout.html">
            <Button
              variant="secondary"
              className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
            >
              Test widget
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
