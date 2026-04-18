import { Link } from 'react-router';
import logoOrbis from '@/assets/logo.png';

type BrandLogoLinkProps = {
  className?: string;
  imgClassName?: string;
};

export function BrandLogoLink({ className = '', imgClassName }: BrandLogoLinkProps) {
  return (
    <Link to="/" className={className}>
      <img
        src={logoOrbis}
        alt="Orbis Publica"
        className={imgClassName ?? 'h-9 w-auto max-h-10 object-contain object-left sm:h-10'}
      />
    </Link>
  );
}
