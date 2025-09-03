// "use client";
import React from 'react'
import { addTodo, getData } from '@/actions/todoAction';

const HomePage = () => {
  addTodo(1, "Sample Todo");
  addTodo(2, "Another Todo");
  const todo = getData();
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
      <p className='mt-4'>{JSON.stringify(todo)}</p>
      
      
    </div>
  )
}

export default HomePage
