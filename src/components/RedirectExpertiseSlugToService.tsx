import { Navigate, useParams } from 'react-router';

/** Anciennes URL /expertises/:slug → fiches publiques sous /services/:slug */
export function RedirectExpertiseSlugToService() {
  const { slug } = useParams();
  if (!slug) return <Navigate to="/services" replace />;
  return <Navigate to={`/services/${slug}`} replace />;
}
