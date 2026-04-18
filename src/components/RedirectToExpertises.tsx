import { Navigate, useParams } from 'react-router';

export function RedirectToExpertises() {
  const { slug } = useParams();
  return <Navigate to={`/expertises/${slug || ''}`} replace />;
}
