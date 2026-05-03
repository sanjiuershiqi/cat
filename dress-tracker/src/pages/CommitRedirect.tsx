import { Navigate, useParams } from 'react-router-dom'

export default function CommitRedirect() {
  const params = useParams()
  const sha = String(params.sha || '')
  return <Navigate to={`/history/${sha}`} replace />
}

