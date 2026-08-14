import { Link } from 'react-router-dom';

function NavDropdown() {
  return (
    <nav className="bg-emr-primary text-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-xl font-semibold">
          EMR System
        </h1>

        <div className="relative group">
          <button className="px-4 py-2 rounded hover:bg-emr-primary-hover">
            ☰ Menu
          </button>

          <div className="absolute right-0 top-full z-10 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
            <div className="bg-emr-primary border border-emr-border rounded shadow-lg w-48">
              <ul className="flex flex-col p-2 space-y-1">
                <li>
                  <Link
                    to="/calendar"
                    className="main-burger"
                  >
                    Calendar
                  </Link>
                </li>

                <li>
                  <Link
                    to="/patients"
                    className="main-burger"
                  >
                    Patients
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavDropdown;