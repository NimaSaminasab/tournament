import Link from 'next/link'

export default function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Velkommen til Persia Fotball turnering
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Administrer turneringer, lag, spillere og kamper på en enkel måte
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link 
              href="/tournaments"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200"
            >
              <div className="text-xl mb-2">🏆</div>
              <div>Administrer Turneringer</div>
              <div className="text-sm opacity-90">Opprett og administrer turneringer</div>
            </Link>
            
            <Link 
              href="/tournaments/new"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200"
            >
              <div className="text-xl mb-2">➕</div>
              <div>Opprett Ny Turnering</div>
              <div className="text-sm opacity-90">Start en ny fotball turnering</div>
            </Link>

            <Link 
              href="/standings"
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200"
            >
              <div className="text-xl mb-2">📊</div>
              <div>Se Tabeller</div>
              <div className="text-sm opacity-90">Ligatabeller og toppscorere</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
