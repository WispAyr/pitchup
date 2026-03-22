export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Platform Settings</h1>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-medium text-white">General</h2>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Platform Name</span>
            <span className="text-gray-300">PitchUp</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Root Domain</span>
            <span className="font-mono text-gray-300">pitchup.local-connect.uk</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Admin Email</span>
            <span className="text-gray-300">admin@pitchup.local-connect.uk</span>
          </div>
        </div>
        <p className="mt-6 text-xs text-gray-600">
          Platform settings are currently managed via environment variables. A full settings editor is coming soon.
        </p>
      </div>
    </div>
  )
}
