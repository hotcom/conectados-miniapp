import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-14 h-14">
            <AvatarImage src="/placeholder.svg?height=56&width=56" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">João Doador</h3>
            <p className="text-sm text-gray-500">@joaodoador</p>
          </div>
        </div>
        <Link href="/profile">
          <Button variant="outline" className="w-full bg-transparent">
            Ver perfil
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-900 mb-3">Causas em destaque</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Emergência RS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Meio Ambiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Educação</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Saúde</span>
          </div>
        </div>
      </div>
    </div>
  )
}
