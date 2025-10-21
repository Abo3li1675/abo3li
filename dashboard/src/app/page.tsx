export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Beginner Workout Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Admin dashboard for managing programs, exercises, users, and content.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 border rounded-lg hover:border-primary transition-colors">
            <h2 className="text-2xl font-semibold mb-2">Programs</h2>
            <p className="text-muted-foreground">
              Create and manage workout programs for different fitness levels.
            </p>
          </div>

          <div className="p-6 border rounded-lg hover:border-primary transition-colors">
            <h2 className="text-2xl font-semibold mb-2">Exercises</h2>
            <p className="text-muted-foreground">
              Add and edit exercise library with videos and instructions.
            </p>
          </div>

          <div className="p-6 border rounded-lg hover:border-primary transition-colors">
            <h2 className="text-2xl font-semibold mb-2">Users</h2>
            <p className="text-muted-foreground">
              Monitor user activity and subscription status.
            </p>
          </div>

          <div className="p-6 border rounded-lg hover:border-primary transition-colors">
            <h2 className="text-2xl font-semibold mb-2">Analytics</h2>
            <p className="text-muted-foreground">
              View detailed statistics and performance metrics.
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Note:</strong> This is a placeholder page. The full dashboard
            implementation will include authentication, data management, and analytics
            features.
          </p>
        </div>
      </div>
    </main>
  )
}
