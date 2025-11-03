import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/images/Sila-logo.png";
import "./styles.css";

function MenuDropdown({ label, items }) {
  return (
    <div className="dropdown" tabIndex={0} aria-haspopup="true">
      <span className="nav-link with-caret">
        {label}
        <svg
          className="caret"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M7 10l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </span>
      <div className="dropdown-menu" role="menu">
        {items.map((it) => (
          <Link
            key={it.href}
            className="dropdown-item"
            to={it.href}
            role="menuitem"
          >
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

const REGISTER_ITEMS = [
  { label: "Charity", href: "/register?type=charity" },
  { label: "Ministry", href: "/register?type=ministry" },
];

export default function Navbar() {
  const { isAuthenticated, user, logout, isMinistryUser } = useAuth();
  const navigate = useNavigate();
  
  // Get ministry name from user data
  const getMinistryName = () => {
    // For ministry users, first_name contains the ministry name
    if (isMinistryUser && user?.first_name) {
      return user.first_name;
    }
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Ministry';
    }
    return user?.email?.split('@')[0] || 'Ministry';
  };

  // Handle logout and redirect to home
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">

        <Link to="/" className="logo">
          <img src={logo} alt="SILA Logo" />
        </Link>

        {isAuthenticated && isMinistryUser ? (
          // Ministry User Navbar
          <>
            <ul className="nav-center">
              <li><Link to="/programs" className="nav-link">Programs</Link></li>
              <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
              <li><Link to="/profile" className="nav-link">Profile</Link></li>
            </ul>

            <div className="nav-right">
              <span className="ministry-name">{getMinistryName()}</span>
              <button className="lang-btn">EN / AR</button>
              <button onClick={handleLogout} className="btn-primary">Logout</button>
            </div>
          </>
        ) : (
          // Public/Regular User Navbar
          <>
            <ul className="nav-center">
              <li><Link to="/" className="nav-link">Home</Link></li>
              <li><Link to="/about" className="nav-link">About</Link></li>
              <li><Link to="/programs" className="nav-link">Programs</Link></li>
              <li><Link to="/events" className="nav-link">Events</Link></li>
              <li><MenuDropdown label="Register" items={REGISTER_ITEMS} /></li>
            </ul>

            <div className="nav-right">
              <button className="lang-btn">EN / AR</button>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="nav-link">Profile</Link>
                  <button onClick={handleLogout} className="btn-primary">Logout</button>
                </>
              ) : (
                <Link to="/login" className="btn-primary">Login</Link>
              )}
            </div>
          </>
        )}

      </div>
    </nav>
  );
}
