import React, { useState } from 'react'
import {useNavigate, useLocation} from 'react-router-dom'

const Project = () => {
  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);

  // Dummy users list
  const users = [
    { id: '1', title: 'User One' },
    { id: '2', title: 'User Two' },
    { id: '3', title: 'User Three' },
    { id: '4', title: 'User Four' },
    { id: '5', title: 'User Five' },
    { id: '6', title: 'User Six' },
    { id: '7', title: 'User Seven' },
    { id: '8', title: 'User Eight' },

    

  ];

  return (
    <main className='h-screen w-screen flex'>
      <section className='relative flex flex-col h-full min-w-96 bg-slate-200'>
        <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100'>
          <button className='flex gap-2' onClick={() => setIsModalOpen(true)}>
            <i className='ri-add-fill mr-1'></i>
            <p>Add Collaborator</p>
          </button>
          <button
            onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
            className='p-2'
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col">
          <div className="message-box flex-grow flex flex-col gap-2 p-2">
            <div className="max-w-60 message flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className='opacity-65 text-xs'>example@gmail.com</small>
              <p className='text-sm'> Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet consectetur.</p>
            </div>
            <div className="max-w-60 ml-auto message flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className='opacity-65 text-xs'>example@gmail.com</small>
              <p className='text-sm'> Lorem ipsum dolor sit amet.</p>
            </div>
          </div>
          <div className="inputField w-full flex">
            <input className='p-2 px-4 border-none outline-none flex-grow' type="text" placeholder='Enter message' /> 
            <button className='bg-slate-950 text-white px-5'>
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${isSidePanelOpen? 'translate-x-0' : '-translate-x-full'} top-0`}>
          <header className='flex justify-end px-3 bg-slate-100'>
            <button className='p-2' onClick={() => setisSidePanelOpen(false)}>
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2">
            <div className="user cursor-pointer p-2 hover:bg-slate-200 flex gap-2 items-center">
              <div className='aspect-square w-fit h-fit flex items-center justify-center rounded-full p-4 text-white bg-slate-600'>
                <i className='ri-user-fill absolute'></i>
              </div>
              <h1 className='font-semibold text-lg'>username</h1>
            </div>
          </div>
        </div>


{/* Modal for user list */}
{isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="relative bg-white rounded-lg shadow-lg w-80 p-5">
              <header className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Select a User</h2>
                <button onClick={() => setIsModalOpen(false)}>
                  <i className="ri-close-fill"></i>
                </button>
              </header>
              <div className="flex flex-col items-start gap-4">
                <ul className="space-y-2 w-full max-h-60 overflow-auto">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      className={`flex items-center p-2 border rounded ${
                        selectedUserId.indexOf(user.id) !== -1
                          ? 'bg-gray-200' // Highlight selected users
                          : 'hover:bg-gray-100'
                      } cursor-pointer`}
                      onClick={() => {
                        setSelectedUserId((prevSelected) =>
                          prevSelected.includes(user.id)
                            ? prevSelected.filter((id) => id !== user.id) // Remove if already selected
                            : [...prevSelected, user.id] // Add if not selected
                        );
                      }}
                    >
                      <i className="ri-user-fill text-xl mr-2"></i>
                      {user.title}
                    </li>
                  ))}
                </ul>
                {selectedUserId.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Selected user IDs: {selectedUserId.join(', ')}
                  </p>
                )}
                <button
                  className="bg-slate-950 text-white py-2 px-6 rounded hover:bg-slate-800"
                  onClick={() => {
                    console.log('Selected Users:', selectedUserId);
                    setIsModalOpen(false); // Close modal after selection
                  }}
                >
                  Add Collaborator
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default Project;