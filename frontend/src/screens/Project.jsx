import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import { UserContext } from '../context/user.context';
import Markdown from 'markdown-to-jsx';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { getWebContainer } from '../config/webContainer';


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

  const [fileTree, setFileTree] = useState({ })

  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [ webContainer, setWebContainer ] = useState(null)
  const [ iframeUrl, setIframeUrl ] = useState(null)
  const [ runProcess, setRunProcess ] = useState(null)



  useEffect(() => {
    // Initialize Socket
    initializeSocket(project._id);
    if (!webContainer) {
      getWebContainer().then(container => {
        setWebContainer(container)
        console.log(container,"Container initialized");
        
        });
    }

    receiveMessage('project-message', (data) => {
     
      const message = JSON.parse(data.message); // parse the message to JSON
      console.log(message);
      webContainer?.mount(message.fileTree)
      
      if (message.fileTree) { 
        setFileTree(message.fileTree)
      }
      setMessages(prev => [...prev, data]); // update messages state
    });

    axios.get(`/projects/get-project/${projectId}`).then(res => {
      setProject(res.data.project)
      setFileTree(res.data.project.fileTree || {})

  })
      
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
      // Assume res.data.project has the updated project info including users
      setProject(res.data.project); 
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

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message)
    return (
      <div className="overflow-auto bg-slate-950 text-white rounded p-2 break-words"> 
        <Markdown
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighLighted,
            },
          }}
        />
      </div>
    )
  }


  function saveFileTree(ft) {
    axios.put('/projects/update-file-tree', {
        projectId: project._id,
        fileTree: ft
    }).then(res => {
        console.log(res.data)
    }).catch(err => {
        console.log(err)
    })
}


  return (
    <main className="h-screen w-screen flex">
      <section className="left relative flex flex-col h-screen w-full md:w-auto md:min-w-96 bg-slate-300">
      <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute top-0 z-50">
  <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
    <i className="ri-add-fill mr-1"></i>
    <p>Add Collaborator</p>
  </button>
  <button 
    onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
    className="p-2"
  >
    <i className="ri-group-fill"></i>
  </button>
</header>



        {/* Increased mobile top padding (pt-20) to avoid collision with the header */}
        <div className="conversation-area pt-16 pb-5 md:pt-14 md:pb-10 flex-grow flex flex-col relative">
          <div className="message-box flex-grow flex flex-col gap-2 p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col p-2 bg-slate-500 w-fit md:w-auto ${
                  msg.sender._id === 'ai'
                    ? 'max-w-[50%] md:max-w-80'
                    : 'max-w-[50%] md:max-w-48'
                } ${msg.sender._id == user._id.toString() ? 'ml-auto' : ''}`}
              >
                <small className="opacity-65 text-xs">{msg.sender.email}</small>
                <p className="text-sm break-words">
                  {msg.sender._id === 'ai' 
                    ? WriteAiMessage(msg.message)
                    : msg.message}
                </p>
              </div>
            ))}
          </div>
          <div className="inputField w-full flex absolute bottom-0">
            <input
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
              className="p-2 px-4 border-none outline-none flex-grow"
              type="text"
              placeholder="Enter message"
            /> 
            <button onClick={send} className="bg-slate-950 text-white px-5">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-transform ${isSidePanelOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'} top-0`}>
  <header className="flex justify-between items-center px-3 py-2 bg-slate-100">
    <h1 className="text-lg font-semibold">Collaborators</h1>
    <button className="p-2" onClick={() => setIsSidePanelOpen(false)}>
      <i className="ri-close-fill"></i>
    </button>
  </header>
  <div className="users flex flex-col gap-2">
    {project.users && project.users.map((user, index) => (
      <div key={index} className="user cursor-pointer p-2 hover:bg-slate-200 flex gap-2 items-center">
        <div className="aspect-square w-fit h-fit flex items-center justify-center rounded-full p-3 text-white bg-slate-600">
          <i className="ri-user-fill absolute text-sm"></i>
        </div>
        <h1 className="text-lg">{user.email}</h1>
      </div>
    ))}
  </div>
</div>
      </section>

      <section className="right bg-red-200 flex-grow h-full flex  ">
 <div className="explorer h-full max-w-64 bg-slate-200 min-w-52 ">
  <div className="file-tree w-full">
   {
    Object.keys(fileTree).map((file, index) => (
      <button onClick={() =>
       { setCurrentFile(file)
        setOpenFiles([...new Set([...openFiles, file])])
       }} key={index} className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full ">
      <p className=' font-semibold text-lg'>{file}</p>
    </button>))

   }
  </div>
 </div>


      <div className="code-editor flex flex-col flex-grow h-full">
      <div className="top flex justify-between w-full">
      <div className="files flex">
      {
        openFiles.map((file, index) => (
          <button key={index} onClick={()=>setCurrentFile(file)}
            className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${currentFile === file ? 'bg-slate-400' : ''}`}>
            <p className="font-semibold text-lg">{file}</p>
            </button>
          
          
      ))
      
      }
      </div>
      <div className="actions flex gap-2">
                            <button
                                onClick={async () => {
                                    await webContainer.mount(fileTree)


                                    const installProcess = await webContainer.spawn("npm", [ "install" ])



                                    installProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    if (runProcess) {
                                        runProcess.kill()
                                    }

                                    let tempRunProcess = await webContainer.spawn("npm", [ "start" ]);

                                    tempRunProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    setRunProcess(tempRunProcess)

                                    webContainer.on('server-ready', (port, url) => {
                                        console.log(port, url)
                                        setIframeUrl(url)
                                    })

                                }}
                                className='p-2 px-4 bg-slate-300 text-white'
                            >
                                run
                            </button>


                        </div>

      </div>
      <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
                        
      {
                            fileTree[ currentFile ] && (
                                <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                                    <pre
                                        className="hljs h-full">
                                        <code
                                            className="hljs h-full outline-none"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const updatedContent = e.target.innerText;
                                                const ft = {
                                                    ...fileTree,
                                                    [ currentFile ]: {
                                                        file: {
                                                            contents: updatedContent
                                                        }
                                                    }
                                                }
                                                setFileTree(ft)
                                                saveFileTree(ft)
                                            }}
                                            dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[ currentFile ].file.contents).value }}
                                            style={{
                                                whiteSpace: 'pre-wrap',
                                                paddingBottom: '25rem',
                                                counterSet: 'line-numbering',
                                            }}
                                        />
                                    </pre>
                                </div>
                            )
                        }
                    </div>

                </div>

                {iframeUrl && webContainer &&
                    (<div className="flex min-w-96 flex-col h-full">
                        <div className="address-bar">
                            <input type="text"
                                onChange={(e) => setIframeUrl(e.target.value)}
                                value={iframeUrl} className="w-full p-2 px-4 bg-slate-200" />
                        </div>
                        <iframe src={iframeUrl} className="w-full h-full"></iframe>
                    </div>)
                }


 

      </section>


      {/* Modal for user list */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="relative bg-white rounded-lg shadow-lg w-11/12 md:w-80 p-5">
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
                    className={`flex items-center p-2 border rounded ${
                      selectedUserId.has(user._id) ? 'bg-gray-200' : 'hover:bg-gray-100'
                    } cursor-pointer text-sm md:text-base`}
                    onClick={() => {
                      setSelectedUserId((prev) => {
                        const newSelection = new Set(prev);
                        newSelection.has(user._id)
                          ? newSelection.delete(user._id)
                          : newSelection.add(user._id);
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
