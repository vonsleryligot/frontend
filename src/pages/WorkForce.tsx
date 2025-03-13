import { useEffect, useState } from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  email: string;
  role: string;
  isVerified: boolean;
}

const WorkForce = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const limit = 5; // Limit users per page

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/accounts?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data: User[] = await response.json();
      setUsers(data.filter((user) => user.isVerified)); // Show only verified users
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-bold mb-4">Registered Users</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <table className="min-w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Full Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Country</th>
                <th className="px-4 py-2 border">City</th>
                <th className="px-4 py-2 border">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400">
                    <td className="px-4 py-2 border">{user.id}</td>
                    <td className="px-4 py-2 border">{user.firstName} {user.lastName}</td>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border">{user.country}</td>
                    <td className="px-4 py-2 border">{user.city}</td>
                    <td className="px-4 py-2 border">{user.role}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-2 border text-center">No users found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={users.length < limit} // Disable if no more users
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkForce;
