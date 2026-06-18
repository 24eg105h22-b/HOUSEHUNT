import React from 'react'
import { Navigate } from 'react-router-dom'
import Home from '../pages/Home'

export default function HomeSwitch(){
  try{
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if(user){
      if(user.role === 'owner') return <Navigate to="/owner" replace />
      if(user.role === 'renter') return <Navigate to="/renter" replace />
      if(user.role === 'admin') return <Navigate to="/admin" replace />
    }
  }catch(e){ }
  return <Home />
}
