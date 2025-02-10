import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios';

const Project = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const projectId = location.state?.project?._id || null; // Safe access to project ID
  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [users, setUsers] = useState([]);
 const [project, setproject] = useState(location.state.project);

  // Fetch Users List
  useEffect(() => {
axios.get(`/projects/get-project/${location.state.project._id}`).then((res) => {
  setproject(res.data.project);
}).catch((err) => console.error("Error fetching project:", err));

    axios.get('/users/all')
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error("Error fetching users:", err));


  }, []);

  // Function to Add Collaborators
  function addCollaborators() {
    if (!projectId) {
      console.error("Project ID is missing!");
      return;
    }

    axios.put('/projects/add-user', {
      projectId: projectId,
      users: Array.from(selectedUserId), // Convert Set to array
    })
    .then(res => {
      console.log("Collaboration Success:", res.data);
      setIsModalOpen(false);
      setSelectedUserId(new Set()); // Reset selection
    })
    .catch(err => console.error("Error adding collaborators:", err));
  }

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
              <p className='text-sm'> Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet..</p>
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
          <header className='flex justify-between items-center px-3 py-2 bg-slate-100'>
        <h1 className=' text-lg font-semibold'>Collaborators</h1>
            <button className='p-2' onClick={() => setisSidePanelOpen(false)}>
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2">
            
           { project.users && project.users.map((user, index) => {
            return (
              <div key={index} className="user cursor-pointer p-2 hover:bg-slate-200 flex gap-2 items-center">
              <div className='aspect-square w-fit h-fit flex items-center justify-center rounded-full p-3 text-white bg-slate-600'>
                <i className='ri-user-fill absolute text-sm'></i>
              </div>
              <h1 className=' text-lg'>{user.email}</h1>
            </div>
            )
           }) }
          </div>
        </div>
        </section>

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
                      key={user._id} // Correct key usage
                      className={`flex items-center p-2 border rounded ${selectedUserId.has(user._id) ? 'bg-gray-200' : 'hover:bg-gray-100'} cursor-pointer`}
                      onClick={() => {
                        setSelectedUserId((prev) => {
                          const newSelection = new Set(prev);
                          if (newSelection.has(user._id)) {
                            newSelection.delete(user._id);
                          } else {
                            newSelection.add(user._id);
                          }
                          return newSelection;
                        });
                      }}
                    >
                      <i className="ri-user-fill text-xl mr-2"></i>
                      {user.email}
                    </li>
                  ))}
                </ul>
              
                <button
                  className="bg-slate-950 text-white py-2 px-6 rounded hover:bg-slate-800"
                onClick={addCollaborators}
                >
                  Add Collaborator
                </button>
              </div>
            </div>
          </div>
        )}
  
    </main>
  )
}

export default Project;