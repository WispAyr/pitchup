'use client'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100">
          <span className="text-4xl">📡</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">You're Offline</h1>
        <p className="mt-2 text-gray-500">
          Check your connection and try again. We'll be here when you're back.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl bg-brand-500 px-8 py-3 text-sm font-bold text-white"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
