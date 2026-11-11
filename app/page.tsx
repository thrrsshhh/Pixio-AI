import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8">
      <main className="flex flex-col items-center text-center max-w-2xl gap-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
          Welcome to <span className="text-violet-600">Pixio AI</span>
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Your all-in-one AI photo studio for instant background removal and image manipulation.
        </p>

        <div className="flex gap-4 mt-4">
          <Link
            href="/studio"
            className="flex h-12 items-center justify-center rounded-full bg-violet-600 px-6 font-medium text-white transition-colors hover:bg-violet-700 shadow-lg"
          >
            Open Photo Studio
          </Link>
        </div>
      </main>
    </div>
  );
}