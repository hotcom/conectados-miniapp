import { Header } from "@/components/header"
import { DonationPage } from "@/components/donation-page"

interface DonatePageProps {
  params: {
    id: string
  }
}

export default function DonatePage({ params }: DonatePageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DonationPage postId={params.id} />
    </div>
  )
}
