import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Login from './features/auth/pages/Login'
import Dashboard from './features/Dashboard/pages/Dashboard'
import CollectionsPage from './features/Dashboard/pages/CollectionsPage'
import TagsPage from './features/Dashboard/pages/TagsPage'
import GraphPage from './features/Dashboard/pages/GraphPage'
import HighlightsPage from './features/Dashboard/pages/HighlightsPage'
import { getMe } from './features/auth/services/auth.api'
import { setUser } from './features/auth/auth.slice'
import Register from './features/auth/pages/Register'

// ✅ Synchronous guard — uses <Navigate> component, no useEffect race condition
const PrivateRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user)
  if (!user) return <Navigate to="/login" replace />
  return children
}

const App = () => {
  const dispatch = useDispatch();
  const [isHydrating, setIsHydrating] = React.useState(true);

  React.useEffect(() => {
    getMe()
      .then(data => {
        if (data && data.user) {
          dispatch(setUser(data.user));
        }
      })
      .catch((err) => {
        console.error("Hydration failed", err);
      })
      .finally(() => {
        setIsHydrating(false);
      });
  }, [dispatch]);

  if (isHydrating) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <h2>Loading your garden...</h2>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path='/register' element={<Register/>}/>
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/graph" element={<PrivateRoute><GraphPage /></PrivateRoute>} />
      <Route path="/collections" element={<PrivateRoute><CollectionsPage /></PrivateRoute>} />
      <Route path="/tags" element={<PrivateRoute><TagsPage /></PrivateRoute>} />
      <Route path="/highlights" element={<PrivateRoute><HighlightsPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
