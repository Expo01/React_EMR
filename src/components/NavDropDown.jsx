// src/components/NavDropdown.jsx
import { Link } from 'react-router-dom';

function NavDropdown() {
  return (
    <nav className="bg-blue-900 text-white px-4 py-3 relative group">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">EMR System</h1>
        <div className="relative">
          <div className="cursor-pointer">☰ Menu</div>

          <div className="absolute bg-blue-800 mt-2 rounded shadow-lg w-48 right-0 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
            <ul className="flex flex-col p-2 space-y-1">
              <li>
                <Link to="/calendar" className="main-burger">Calendar</Link>
              </li>
              <li>
                <Link to="/patients" className="main-burger">Patients</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavDropdown;
