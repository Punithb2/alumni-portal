import { useRoutes } from 'react-router-dom'
import { AuthProvider } from './app/contexts/FirebaseAuthContext'
import { GamificationProvider } from './app/contexts/GamificationContext'
import ErrorBoundary from './app/components/ErrorBoundary'
import routes from './app/routes'

export default function App() {
  const content = useRoutes(routes)

  return (
    <ErrorBoundary>
      <GamificationProvider>
        <AuthProvider>{content}</AuthProvider>
      </GamificationProvider>
    </ErrorBoundary>
  )
}
