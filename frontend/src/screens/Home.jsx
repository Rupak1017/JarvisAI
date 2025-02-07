import React, { useContext, useState } from 'react'
import {UserContext} from '../context/user.context'

export const Home = () => {

  const {user} = useContext(UserContext)
  const [isModalOpen, setisModalOpen] = useState(false)
  const [projectName, setProjectName] = useState(null)

function createProject(e) {
  e.preventDefault()
  console.log('Creating project')
  console.log(projectName)
}

  return (
    <main className='p-4'>
      <div className='projects'>
        <button  
         onClick={() => setisModalOpen(true)}
        className='project p-5 border border-slate-300 rounded-md'>
          New Project
        <i className="ri-link ml-2"></i>
        </button>
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
