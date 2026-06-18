import React from 'react'
import { Link } from 'react-router-dom'
import API from '../api'

export default function NavBar(){
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [notesCount, setNotesCount] = React.useState(0)

  React.useEffect(()=>{
    if(user){
      API.get('/notifications').then(r=>setNotesCount(Array.isArray(r.data)?r.data.filter(n=>!n.read).length:0)).catch(()=>{})
    }
  },[user])

  const [backendStatus, setBackendStatus] = React.useState(null)
  const checkBackend = async ()=>{
    setBackendStatus('checking')
    try{
      const res = await API.get('/ping')
      if(res && res.data && res.data.status==='ok') setBackendStatus('ok')
      else setBackendStatus('error')
    }catch(e){ setBackendStatus('error') }
  }
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">HouseHunt</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item d-flex align-items-center ms-2">
              <button className="btn btn-sm btn-outline-primary me-2" onClick={checkBackend}>Connect</button>
              {backendStatus === 'ok' && <span className="text-success">Backend OK</span>}
              {backendStatus === 'checking' && <span className="text-muted">Checking...</span>}
              {backendStatus === 'error' && <span className="text-danger">Backend error</span>}
            </li>
            {user ? (
              <>
                {user && user.role === 'owner' && (<li className="nav-item"><Link className="nav-link" to="/create">Create</Link></li>)}
                <li className="nav-item"><Link className="nav-link" to="/bookings">Bookings</Link></li>
                {user && user.role === 'owner' && (<li className="nav-item"><Link className="nav-link" to="/owner">Owner</Link></li>)}
                {user && user.role === 'renter' && (<li className="nav-item"><Link className="nav-link" to="/renter">Renter</Link></li>)}
                {user && user.role === 'owner' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/notifications">Notifications {notesCount>0 && <span className="badge bg-danger ms-1">{notesCount}</span>}</Link>
                  </li>
                )}
                {user && user.role === 'admin' && (<li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>)}
                {user && user.role === 'admin' && (<li className="nav-item"><Link className="nav-link" to="/owners">Owners</Link></li>)}
                <li className="nav-item"><a className="nav-link" href="#" onClick={async (e) => { e.preventDefault(); try{ await API.post('/auth/logout'); }catch{} localStorage.removeItem('token'); localStorage.removeItem('user'); window.location='/'; }}>Logout</a></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
