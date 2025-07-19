import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Globe, Calendar, Wallet } from "lucide-react"

export function ProfileHeader() {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="w-32 h-32 mx-auto md:mx-0">
            <AvatarImage src="/placeholder.svg?height=128&width=128" />
            <AvatarFallback className="text-2xl">ICF</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold">Instituto Criança Feliz</h1>
              <div className="flex gap-2 justify-center md:justify-start">
                <Badge variant="secondary">Verificado</Badge>
                <Badge variant="outline">ONG</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-center md:justify-start mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                São Paulo, SP
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                www.criancafeliz.org.br
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Desde 2015
              </div>
            </div>

            <p className="text-gray-700 mb-4 max-w-2xl">
              Trabalhamos para garantir direitos básicos às crianças em situação de vulnerabilidade social. Nossa missão
              é proporcionar educação, alimentação e cuidados essenciais para um futuro melhor.
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
              <div className="text-center">
                <div className="font-bold text-lg">1.2M</div>
                <div className="text-sm text-gray-600">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">234</div>
                <div className="text-sm text-gray-600">Seguindo</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">R$ 2.5M</div>
                <div className="text-sm text-gray-600">Arrecadado</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">15.3K</div>
                <div className="text-sm text-gray-600">Beneficiados</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4" />
                <span className="font-medium text-sm">Wallet de Doações</span>
              </div>
              <code className="text-xs bg-white px-2 py-1 rounded border font-mono">
                0x1234567890abcdef1234567890abcdef12345678
              </code>
            </div>

            <div className="flex gap-3 justify-center md:justify-start">
              <Button>Seguir</Button>
              <Button variant="outline">Mensagem</Button>
              <Button variant="outline">Doar</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
