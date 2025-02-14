import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, receiveMessage,sendMessage } from '../config/socket';
import { UserContext } from '../context/user.context';
import Markdown from 'markdown-to-jsx';


const Project = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const projectId = location.state?.project?._id || null;
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState('');
  const { user } = useContext(UserContext);
  const messageBox = useRef(null); // ✅ Use useRef() instead of createRef()

  useEffect(() => {
    // Initialize Socket
    initializeSocket(project._id);

    receiveMessage('project-message', (data) => {
      console.log('Received Message:', data);
      appendIncomingMessage(data);
    });

    axios.get(`/projects/get-project/${projectId}`)
      .then((res) => setProject(res.data.project))
      .catch((err) => console.error('Error fetching project:', err));

    axios.get('/users/all')
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  function addCollaborators() {
    if (!projectId) {
      console.error('Project ID is missing!');
      return;
    }

    axios.put('/projects/add-user', {
      projectId: projectId,
      users: Array.from(selectedUserId),
    })
    .then((res) => {
      console.log('Collaboration Success:', res.data);
      setIsModalOpen(false);
      setSelectedUserId(new Set());
    })
    .catch((err) => console.error('Error adding collaborators:', err));
  }

  const send = () => {
    sendMessage('project-message', {
      message,
      sender: user, 
    });
    appendOutgoingMessage(message);
    setMessage('');
  };

  function appendIncomingMessage(messageObject) {
    if (!messageBox.current) return; // ✅ Check if ref exists

    const message = document.createElement('div');
    message.classList.add('message', 'max-w-56', 'flex', 'flex-col', 'p-2', 'bg-slate-500');


    if(messageObject.sender._id === 'ai') {
      const markDown = (<Markdown> {messageObject.message} </Markdown> )
      message.innerHTML = `
      <small class='opacity-65 text-xs'>${messageObject.sender.email}</small>
      <p class='text-sm'>${markDown}</p>
      `

    }else{
      message.innerHTML = `
      <small class='opacity-65 text-xs'>${messageObject.sender.email}</small>
      <p class='text-sm'>${messageObject.message}</p>
    `;
    messageBox.current.appendChild(message);
    }


   
 
    scrollToBottomTop();
  }

  function appendOutgoingMessage(message) {
    if (!messageBox.current) return; // ✅ Check if ref exists

    const newMessage = document.createElement('div');
    newMessage.classList.add('message', 'max-w-56', 'flex', 'flex-col', 'rounded-md' ,'p-2', 'bg-slate-500', 'ml-auto');
    newMessage.innerHTML = `
      <small class='opacity-65 text-xs'>${user.email}</small>
      <p class='text-sm'>${message}</p>
    `;
    messageBox.current.appendChild(newMessage);
    scrollToBottomTop();
  }

  function scrollToBottomTop() {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight; // ✅ No more null errors
    }
  }

  return (
    <main className='h-screen w-screen flex '>
      <section className='left relative flex flex-col h-screen min-w-96 bg-slate-300'>
        <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute top-0 '>
          <button className='flex gap-2' onClick={() => setIsModalOpen(true)}>
            <i className='ri-add-fill mr-1'></i>
            <p>Add Collaborator</p>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className='p-2'
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area  pt-14 pb-10 flex-grow flex flex-col relative">

        <div ref={messageBox} className="message-box flex-grow flex  flex-col gap-2 p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
  
  
          
          </div>
          <div className="inputField w-full flex absolute bottom-0 ">
            <input
            value={message}
            onChange={ (e)=>setMessage(e.target.value)}
            className='p-2 px-4 border-none outline-none flex-grow' type="text" placeholder='Enter message' /> 
            <button 
            onClick={send}
            className='bg-slate-950 text-white px-5'>
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${isSidePanelOpen? 'translate-x-0' : '-translate-x-full'} top-0`}>
          <header className='flex justify-between items-center px-3 py-2 bg-slate-100'>
        <h1 className=' text-lg font-semibold'>Collaborators</h1>
            <button className='p-2' onClick={() => setIsSidePanelOpen(false)}>
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