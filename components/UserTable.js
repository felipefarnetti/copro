export default function UserTable({ users }) {
  if (!users || users.length === 0) return <div>Aucun utilisateur trouvé.</div>;
  return (
    <table className="w-full border mt-2 mb-8">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-2 py-1">Email</th>
          <th className="border px-2 py-1">Rôle</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u._id}>
            <td className="border px-2 py-1">{u.email}</td>
            <td className="border px-2 py-1">{u.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
