import React from 'react';
import { syncUser } from '@/actions/syncUser';
import { createUser, getUsers } from '@/actions/todoAction';

const HomePage = async () => {
  let users = [] as Array<{
    id: string;
    clerkId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    siteRole: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>;
  try {
    await syncUser();
    users = await getUsers();
  } catch (error) {
    console.error(`Error occurred: ${error}`);
  }
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Welcome to My Blog</h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto">
          Dive into posts and connect with our community of users.
        </p>
      </header>

      <section>
        <h2 className="text-3xl font-semibold mb-6 border-b border-gray-200 pb-2">
          Registered Users
        </h2>

        {users.length === 0 ? (
          <p className="text-center text-gray-500">No users found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center"
              >
                <img
                  src={user.avatarUrl ?? '/default-avatar.png'}
                  alt={`${user.name}'s avatar`}
                  width={100}
                  height={100}
                  className="rounded-full object-cover mb-4 border border-gray-300"
                />
                <h3 className="text-xl font-bold mb-1 text-gray-900">{user.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{user.siteRole.toUpperCase()}</p>
                <p className="text-gray-700 mb-2 truncate max-w-xs">{user.bio ?? "No bio available."}</p>
                <p className="text-gray-500 text-xs mb-1">
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p className="text-gray-500 text-xs break-all">
                  <span className="font-semibold">Clerk ID:</span> {user.clerkId}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 text-center">
        <a
          href="/write"
          className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          Create a New Post
        </a>
      </section>
    </main>
  );
};

export default HomePage;
