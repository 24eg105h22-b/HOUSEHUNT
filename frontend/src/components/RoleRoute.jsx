import React from 'react'
import { Navigate } from 'react-router-dom'

export default function RoleRoute({ children, role }){
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}
