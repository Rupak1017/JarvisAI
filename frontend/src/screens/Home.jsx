import React, { useContext, useEffect, useState } from 'react'
import {UserContext} from '../context/user.context'
import axios from '../config/axios'
import {useNavigate} from 'react-router-dom'

export const Home = () => {

  const {user} = useContext(UserContext)
  const [isModalOpen, setisModalOpen] = useState(false)
  const [projectName, setProjectName] = useState(null)
  const [project, setProject] = useState([])

  const navigate = useNavigate()

function createProject(e) {
  e.preventDefault()
  
  console.log({projectName})

  axios.post('/projects/create', { name: projectName })
  .then(res => {
    console.log(res);
    // Append the new project directly to the existing state
    setProject(prevProjects => [...prevProjects, res.data]);
    setisModalOpen(false);
  })
  .catch(error => {
    console.log(error);
  });


}

useEffect(() => {
  axios.get('/projects/all').then((res) => {
    console.log(res.data)
    setProject(res.data.projects || []);
  })
  .catch(error => {
    console.log(error)
  })
  }, [])



  return (
    <main className='p-4'>
      <div className='projects flex flex-wrap gap-3'>
        <button  
         onClick={() => setisModalOpen(true)}
        className='project p-5 border border-slate-300 rounded-md'>
          New Project
        <i className="ri-link ml-2"></i>
        </button>

        {
          project.map((project) => (
            <div key={project._id} 
            onClick={()=> {navigate(`/project`, {state: {project}})}}
            className='project flex flex-col gap-2 cursor-pointer p-5 border border-slate-300 rounded-md min-w-52 hover:bg-slate-200'>
              <h2 className='font-semibold'> 
                {project.name} 

              </h2>
              <div className='flex gap-2'>
                <p> <small> <i className="ri-user-line"></i> Collaborators :</small></p>
                
                {project.users.length}
              </div>
             
            </div>
          ))
        }
      </div>

    {isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Create New Project</h2>
          <form onSubmit={createProject}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectName">
                Project Name
              </label>
              <input
                onChange={(e) => setProjectName(e.target.value)}
                value={projectName}
                type="text"
                id="projectName"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setisModalOpen(false)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}


    </main>
  )
}
