import React from 'react'
import {Route, BrowserRouter,Routes} from 'react-router-dom'
import Login from '../screens/Login'
import Register from '../screens/Register'
import { Home } from '../screens/Home'
import Project from '../screens/Project'
import UserAuth from '../auth/UserAuth'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={ <UserAuth><Home/></UserAuth> } />
        <Route exact path='/login' element={<Login/>} />
        <Route exact path='/register' element={<Register/>} />
        <Route exact path='/project' element={<UserAuth> <Project/></UserAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes