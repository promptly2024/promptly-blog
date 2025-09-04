// "use client";
import { syncUser } from '@/actions/syncUser';
import { createUser, getUsers } from '@/actions/todoAction';
import React from 'react'

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
    // await createUser("John Doe", "john@example.com", "someClerkId");
    // await createUser("Jane Doe", "jane@example.com");
    users = await getUsers();
    // console.log(`users: ${JSON.stringify(users)}`);
  } catch (error) {
    console.error(`Error occurred: ${error}`);
  }
  return (
    <div>
      {/* <header className="flex justify-end items-center p-4 gap-4 h-16">
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header> */}
      <h1 className='text-4xl font-bold'>Welcome to My Blog</h1>
      <p className='text-lg'>This is the home page of my blog app.</p>
      Users:
      <p className='mt-4'>{users.length === 0 ? 'No users found.' : users.map(user => (
        <div key={user.id}>
          <h2 className='text-xl font-semibold'>{user.name}</h2>
          <p className='text-gray-600'>Email: {user.email}</p>
          <p className='text-gray-600'>Bio: {user.bio}</p>
          <p className='text-gray-600'>Avatar URL: {user.avatarUrl}</p>
          <p className='text-gray-600'>Clerk ID: {user.clerkId}</p>
          <img src={user.avatarUrl ?? undefined} alt={`${user.name}'s avatar`} width={100} height={100} />
          {/* Optionally display more user info if needed */}
        </div>
      ))}</p>
    </div>
  )
}

export default HomePage
