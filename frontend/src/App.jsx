import React from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import HomeSwitch from './components/HomeSwitch'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateProperty from './pages/CreateProperty'
import PropertyDetails from './pages/PropertyDetails'
import Bookings from './pages/Bookings'
import Admin from './pages/Admin'
import Owners from './pages/Owners'
import OwnerDashboard from './pages/OwnerDashboard'
import RenterDashboard from './pages/RenterDashboard'
import EditProperty from './pages/EditProperty'
import Notifications from './pages/Notifications'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'

export default function App(){
  React.useEffect(()=>{
    import('./api').then(({ default: API })=>{
      API.get('/users/me').then(r=>{
        if (r && r.data) localStorage.setItem('user', JSON.stringify(r.data))
      }).catch(()=>{
        localStorage.removeItem('user')
      })
    })
  }, [])
  return (
    <div>
      <NavBar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomeSwitch/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/create" element={<ProtectedRoute><RoleRoute role="owner"><CreateProperty/></RoleRoute></ProtectedRoute>} />
          <Route path="/properties/:id" element={<PropertyDetails/>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings/></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><RoleRoute role="admin"><Admin/></RoleRoute></ProtectedRoute>} />
          <Route path="/owners" element={<ProtectedRoute><RoleRoute role="admin"><Owners/></RoleRoute></ProtectedRoute>} />
          <Route path="/owner" element={<ProtectedRoute><RoleRoute role="owner"><OwnerDashboard/></RoleRoute></ProtectedRoute>} />
          <Route path="/renter" element={<ProtectedRoute><RoleRoute role="renter"><RenterDashboard/></RoleRoute></ProtectedRoute>} />
          <Route path="/properties/:id/edit" element={<ProtectedRoute><RoleRoute role="owner"><EditProperty/></RoleRoute></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><RoleRoute role="owner"><Notifications/></RoleRoute></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  )
}
