import { useIsAdmin } from '@/lib/auth.jsx';
import { useEffect, useState } from 'react';
import { usersAPI, plansAPI } from '@/lib/api';

const UserPlansPage = () => {
  const isAdmin = useIsAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPlans, setUserPlans] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersAPI.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchPlans = async (userId) => {
    try {
      setLoading(true);
      setSelectedUser(userId);
      const data = await plansAPI.getAllPlansByUserId(userId);
      setUserPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setUserPlans([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Plans</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-semibold p-4 border-b">Users</h2>
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => fetchPlans(user.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 ${
                  selectedUser === user.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center">
                  {user.photo && (
                    <img
                      className="h-10 w-10 rounded-full mr-3"
                      src={user.photo}
                      alt={user.name}
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Plans List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-semibold p-4 border-b">
            {selectedUser ? `Plans for ${users.find(u => u.id === selectedUser)?.name}` : 'Select a user to view plans'}
          </h2>
          <div className="divide-y divide-gray-200">
            {userPlans.length > 0 ? (
              userPlans.map((plan) => (
                <div key={plan.id} className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500">Created: {new Date(plan.created_at).toLocaleDateString()}</p>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Courses:</h4>
                    <ul className="mt-1 space-y-1">
                      {plan.courses?.map((course) => (
                        <li key={course.id} className="text-sm text-gray-600">
                          {course.course_code} - {course.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {selectedUser ? 'No plans found' : 'Select a user to view their plans'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPlansPage; 