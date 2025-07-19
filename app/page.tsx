import { Header } from "@/components/header"
import { Feed } from "@/components/feed"
import { Sidebar } from "@/components/sidebar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
          <div className="lg:col-span-2">
            <Feed />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3">Sugestões para você</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        ONG
                      </div>
                      <div>
                        <p className="text-sm font-medium">Casa da Criança</p>
                        <p className="text-xs text-gray-500">Sugerido para você</p>
                      </div>
                    </div>
                    <button className="text-blue-500 text-sm font-medium hover:text-blue-600">Seguir</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
