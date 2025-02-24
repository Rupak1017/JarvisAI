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

const SyntaxHighLighted = ({ children, language }) => (
  <SyntaxHighlighter language={language} style={atomOneDark}>
    {children}
  </SyntaxHighlighter>
);

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
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);

  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(true);

  // New states for loading indicators
  const [runLoading, setRunLoading] = useState(false);
  const [killLoading, setKillLoading] = useState(false);

  useEffect(() => {
    const fileKeys = Object.keys(fileTree);
    if (fileKeys.length > 0 && !currentFile) {
      const firstFile = fileKeys[0];
      setCurrentFile(firstFile);
      setOpenFiles(prev => [...new Set([...prev, firstFile])]);
    }
  }, [fileTree, currentFile]);

  useEffect(() => {
    // Initialize Socket and container
    initializeSocket(project._id);
    if (!webContainer) {
      getWebContainer().then(container => {
        setWebContainer(container);
        console.log(container, "Container initialized");
      });
    }

    receiveMessage('project-message', (data) => {
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(data.message);
      } catch (err) {
        parsedMessage = data.message;
      }
      console.log(parsedMessage);

      if (typeof parsedMessage === 'object' && parsedMessage.fileTree) {
        webContainer?.mount(parsedMessage.fileTree);
        setFileTree(parsedMessage.fileTree);
      }
      setMessages(prev => [...prev, data]);
    });

    axios.get(`/projects/get-project/${projectId}`)
      .then(res => {
        setProject(res.data.project);
        setFileTree(res.data.project.fileTree || {});
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
        setProject(res.data.project);
        setIsModalOpen(false);
        setSelectedUserId(new Set());
      })
      .catch((err) => console.error('Error adding collaborators:', err));
  }

  const send = () => {
    sendMessage('project-message', { message, sender: user });
    setMessages(prev => [...prev, { message, sender: user }]);
    setMessage('');
  };

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message);
    return (
      <div className="overflow-auto bg-black text-white rounded p-2 break-words">
        <Markdown
          children={messageObject.text}
          options={{ overrides: { code: SyntaxHighLighted } }}
        />
      </div>
    );
  }

  function saveFileTree(ft) {
    axios.put('/projects/update-file-tree', {
      projectId: project._id,
      fileTree: ft
    })
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }

  return (
    <main className="flex h-screen">
      {/* Left Panel – Chat */}
      <section className="w-1/3 border-r border-gray-300 flex flex-col">
        <header className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-300 flex justify-between items-center shadow">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <i className="ri-add-fill"></i>
            <span>Add Collaborator</span>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(true)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>
        <div className="flex-grow overflow-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded shadow transition transform hover:scale-105 ${
                msg.sender._id === 'ai'
                  ? "max-w-[80%] bg-black text-white"
                  : "max-w-[70%] bg-white text-black border border-gray-300"
              } ${msg.sender._id === user._id.toString() ? 'ml-auto' : ''}`}
            >
              <small className="opacity-75 text-xs mb-1">{msg.sender.email}</small>
              <div className="text-sm break-words">
                {msg.sender._id === 'ai'
                  ? WriteAiMessage(msg.message)
                  : msg.message}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-gray-300">
          {/* Predefined scrollable questions */}
          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setMessage("@ai create me a basic express server ")}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition whitespace-nowrap"
              >
                @ai create me a basic express server 
              </button>
              <button
                onClick={() => setMessage("@ai write me a JavaScript function for two-sum")}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition whitespace-nowrap"
              >
                @ai write me a JavaScript function for two-sum
              </button>
            </div>
          </div>
          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message with @ai to start chat with Jarvis AI"
              className="flex-grow border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              onClick={send}
              className="bg-gray-800 text-white px-4 py-2 rounded-r hover:bg-gray-700 transition"
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Right Panel – Code Editor & Directory (Dark Theme) */}
      <section className="flex-grow flex flex-col bg-gray-900 text-white">
        <div className="flex border-b border-gray-700 px-4 py-3 items-center">
          <div className="flex space-x-4">
            {openFiles.map((file, index) => (
              <button
                key={index}
                className={`relative flex items-center px-3 py-2 rounded transition hover:bg-gray-700 ${currentFile === file ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setCurrentFile(file)}
              >
                <span>{file}</span>
                <i
                  onClick={(e) => {
                    e.stopPropagation();
                    const newOpenFiles = openFiles.filter(f => f !== file);
                    setOpenFiles(newOpenFiles);
                    if (currentFile === file) {
                      setCurrentFile(newOpenFiles[0] || null);
                    }
                  }}
                  className="ri-close-line ml-2 cursor-pointer"
                ></i>
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
          <button
  onClick={async () => {
    if (!webContainer) {
      console.warn("WebContainer not available. This functionality is only enabled in environments that support it.");
      setRunLoading(false);
      return;
    }
    setRunLoading(true);
    try {
      await webContainer.mount(fileTree);
      const installProcess = await webContainer.spawn("npm", ["install"]);
      installProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(chunk);
          }
        })
      );
      if (runProcess) runProcess.kill();
      const tempRunProcess = await webContainer.spawn("npm", ["start"]);
      tempRunProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(chunk);
          }
        })
      );
      setRunProcess(tempRunProcess);
      webContainer.on("server-ready", (port, url) => {
        console.log(port, url);
        setIframeUrl(url);
      });
    } catch (error) {
      console.error("Error running process:", error);
    }
    setRunLoading(false);
  }}
  className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition flex items-center"
>
  {runLoading ? (
    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
  ) : "Run"}
</button>

            <button
              onClick={async () => {
                if (runProcess) {
                  setKillLoading(true);
                  runProcess.kill();
                  setRunProcess(null);
                  setIframeUrl(null);
                  console.log("Killed process on port 3000");
                  setKillLoading(false);
                } else {
                  console.log("No process running on port 3000 to kill");
                }
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center"
            >
              {killLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : "Kill Port"}
            </button>
          </div>
        </div>
        <div className="flex flex-grow overflow-hidden">
          <aside className="w-64 border-r border-gray-700 bg-gray-800 flex flex-col">
            <button
              onClick={() => setIsDirectoryOpen(!isDirectoryOpen)}
              className="flex items-center justify-between px-4 py-3 border-b border-gray-700 hover:bg-gray-700 transition"
            >
              <span className="text-lg font-medium">Directory</span>
              <i className={`ri-arrow-drop-${isDirectoryOpen ? 'up' : 'down'}-line`}></i>
            </button>
            <div className={`overflow-auto transition-all ${isDirectoryOpen ? 'block' : 'hidden'}`}>
              {Object.keys(fileTree).map((file, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles([...new Set([...openFiles, file])]);
                  }}
                  className="text-left w-full px-4 py-2 hover:bg-gray-700 transition"
                >
                  {file}
                </button>
              ))}
            </div>
          </aside>
          <main className="flex-grow overflow-auto bg-gray-900 p-4">
            {fileTree[currentFile] && (
              <pre className="hljs">
                <code
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updatedContent = e.target.innerText;
                    const ft = {
                      ...fileTree,
                      [currentFile]: { file: { contents: updatedContent } }
                    };
                    setFileTree(ft);
                    saveFileTree(ft);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight('javascript', fileTree[currentFile]?.file?.contents || '').value
                  }}
                  
                  className="outline-none"
                  style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', paddingBottom: '25rem' }}
                />
              </pre>
            )}
          </main>
        </div>
      </section>

      {/* Optional Iframe Panel */}
      {iframeUrl && webContainer && (
        <section className="w-1/3 border-l border-gray-700 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-700">
            <input
              type="text"
              value={iframeUrl}
              onChange={(e) => setIframeUrl(e.target.value)}
              className="w-full border border-gray-700 rounded px-3 py-2 focus:outline-none"
            />
          </div>
          <iframe src={iframeUrl} className="flex-grow" title="Web Preview" />
        </section>
      )}

      {/* Collaborators Side Panel (Sliding Overlay) */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-300 shadow-lg z-50 transform transition-transform duration-300 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <header className="px-4 py-3 border-b border-gray-300 relative">
          <h1 className="font-semibold text-black">Collaborators</h1>
          <button onClick={() => setIsSidePanelOpen(false)} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
            <i className="ri-close-fill"></i>
          </button>
        </header>
        <div className="p-4 space-y-3">
          {project.users && project.users.map((usr, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-100 transition">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white">
                <i className="ri-user-fill"></i>
              </div>
              <span>{usr.email}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Collaborator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <header className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-semibold">Select a User</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:text-gray-700">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <ul className="max-h-60 overflow-auto space-y-2">
              {users.map((usr) => (
                <li
                  key={usr._id}
                  onClick={() => {
                    setSelectedUserId((prev) => {
                      const newSelection = new Set(prev);
                      newSelection.has(usr._id)
                        ? newSelection.delete(usr._id)
                        : newSelection.add(usr._id);
                      return newSelection;
                    });
                  }}
                  className={`p-2 border rounded transition cursor-pointer hover:bg-gray-100 ${selectedUserId.has(usr._id) ? 'bg-gray-200' : 'bg-white'}`}
                >
                  <i className="ri-user-fill text-xl mr-3"></i>
                  {usr.email}
                </li>
              ))}
            </ul>
            <button
              onClick={addCollaborators}
              className="mt-4 bg-gray-800 text-white w-full py-2 rounded hover:bg-gray-700 transition"
            >
              Add Collaborator
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
