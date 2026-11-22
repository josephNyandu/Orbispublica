import { Outlet } from 'react-router';

export default function CabinetLayout() {
  return (
    <div className="pt-36">
      <Outlet />
    </div>
  );
}
