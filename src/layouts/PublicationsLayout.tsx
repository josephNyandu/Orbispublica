import { Outlet } from 'react-router';

export default function PublicationsLayout() {
  return (
    <div className="pt-36">
      <Outlet />
    </div>
  );
}
