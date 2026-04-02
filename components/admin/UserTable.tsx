'use client'
interface Props { users: any[] }

export default function UserTable({ users }: Props) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-6">Users ({users.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-neutral-500 text-left border-b border-neutral-800">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Role</th>
              <th className="pb-3 font-medium">Subscription</th>
              <th className="pb-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {users.map((u) => (
              <tr key={u.id} className="text-neutral-300">
                <td className="py-3 font-medium text-white">{u.full_name}</td>
                <td className="py-3">{u.email}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    u.role === 'admin'
                      ? 'bg-purple-400/20 text-purple-400'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3">
                  {u.subscriptions?.[0] ? (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      u.subscriptions[0].status === 'active'
                        ? 'bg-lime-400/20 text-lime-400'
                        : 'bg-red-400/20 text-red-400'
                    }`}>
                      {u.subscriptions[0].plan} · {u.subscriptions[0].status}
                    </span>
                  ) : (
                    <span className="text-neutral-600 text-xs">None</span>
                  )}
                </td>
                <td className="py-3 text-neutral-500">
                  {new Date(u.created_at).toLocaleDateString('en-GB')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}