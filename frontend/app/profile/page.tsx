import { Header } from "@/components/header"
import { ProfileHeader } from "@/components/profile-header"
import { ProfilePosts } from "@/components/profile-posts"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ProfileHeader />
        <ProfilePosts />
      </div>
    </div>
  )
}
