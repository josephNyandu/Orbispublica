import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  name?: string;
}

export function SEO({ 
  title, 
  description, 
  type = 'website', 
  name = 'ORBIS PUBLICA' 
}: SEOProps) {
  const fullTitle = title ? `${title} | ${name}` : `${name} - L'Excellence dans les Affaires Publiques`;
  const metaDescription = description || "Cabinet de conseil spécialisé en affaires publiques, appels d'offres, financements et stratégies d'investissement.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
    </Helmet>
  );
}
