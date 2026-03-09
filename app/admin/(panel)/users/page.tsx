import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/admin-auth'
import { readAdminUsers } from '@/lib/admin-users'
import { UsersClient } from '@/components/admin/users-client'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect('/admin/login')
  if (currentUser.role !== 'owner') redirect('/admin/dashboard')

  const users = readAdminUsers()

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage who has access to the admin panel.</p>
        </div>
      </div>
      <UsersClient users={users} currentUserId={currentUser.id} />
    </div>
  )
}
