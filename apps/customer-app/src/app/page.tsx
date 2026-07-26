export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Quicko
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Groceries & essentials delivered in 10-30 minutes
          </p>
          <div className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold">
            Coming Soon
          </div>
        </div>
      </div>
    </main>
  );
}
