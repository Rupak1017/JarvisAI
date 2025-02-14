import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import { UserContext } from '../context/user.context';
import Markdown from 'markdown-to-jsx';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'; // Import SyntaxHighlighter
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // Dark theme

const SyntaxHighLighted = ({ children, language }) => {
  return (
    <SyntaxHighlighter language={language} style={atomOneDark}>
      {children}
    </SyntaxHighlighter>
  );
}


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
	const [messages, setMessages] = useState([]); // new state for messages
	const { user } = useContext(UserContext);

	useEffect(() => {
		// Initialize Socket
		initializeSocket(project._id);

		receiveMessage('project-message', (data) => {
			console.log('Received Message:', data);
			setMessages(prev => [...prev, data]); // update messages state
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
		setMessages(prev => [...prev, { message, sender: user }]); // update messages state
		setMessage('');
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

				<div className="conversation-area pt-14 pb-10 flex-grow flex flex-col relative">
					
          <div className="message-box flex-grow flex flex-col gap-2 p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
						{messages.map((msg, index) => (
              <div key={index} className={`message  flex flex-col p-2 bg-slate-500 ${msg.sender._id === 'ai' ? 
                
                'max-w-80' : 'max-w-48'}  ${msg.sender._id == user._id.toString() && 'ml-auto '}`}
            >
             <small className='opacity-65 text-xs'>{msg.sender.email}</small>
             <p className='text-sm'>
              {msg.sender._id === 'ai' ? 
              <div className='overflow-auto bg-slate-950 text-white rounded p-2'> 

<Markdown options={{
                        overrides: {
                          code: {
                            component: SyntaxHighLighted,
                          },
                        },
                      }}>
                        {msg.message}
                      </Markdown>
              </div>
              
              : msg.message}</p>
        
								</div>
					
						))}
					</div>
					<div className="inputField w-full flex absolute bottom-0 ">
						<input
							value={message}
							onChange={(e)=>setMessage(e.target.value)}
							className='p-2 px-4 border-none outline-none flex-grow'
							type="text"
							placeholder='Enter message'
						/> 
						<button onClick={send} className='bg-slate-950 text-white px-5'>
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
						{ project.users && project.users.map((user, index) => (
							<div key={index} className="user cursor-pointer p-2 hover:bg-slate-200 flex gap-2 items-center">
								<div className='aspect-square w-fit h-fit flex items-center justify-center rounded-full p-3 text-white bg-slate-600'>
									<i className='ri-user-fill absolute text-sm'></i>
								</div>
								<h1 className=' text-lg'>{user.email}</h1>
							</div>
						))}
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
										key={user._id}
										className={`flex items-center p-2 border rounded ${selectedUserId.has(user._id) ? 'bg-gray-200' : 'hover:bg-gray-100'} cursor-pointer`}
										onClick={() => {
											setSelectedUserId((prev) => {
												const newSelection = new Set(prev);
												newSelection.has(user._id) ? newSelection.delete(user._id) : newSelection.add(user._id);
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