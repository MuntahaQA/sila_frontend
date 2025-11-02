import { Link } from "react-router-dom";
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

const ABOUT_ITEMS = [
  { label: "Overview", href: "/about/overview" },
  { label: "How It Works", href: "/about/how-it-works" },
  { label: "Our Impact", href: "/about/impact" },
  { label: "Partners", href: "/about/partners" },
  { label: "FAQs", href: "/about/faqs" },
];

const REGISTER_ITEMS = [
  { label: "Charity", href: "/register/charity" },
  { label: "Ministry", href: "/register/ministry" },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-inner">

        <Link to="/" className="logo">
          <img src={logo} alt="SILA Logo" />
        </Link>

        <ul className="nav-center">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><MenuDropdown label="About" items={ABOUT_ITEMS} /></li>
          <li><Link to="/programs" className="nav-link">Programs</Link></li>
          <li><Link to="/events" className="nav-link">Events</Link></li>
          <li><MenuDropdown label="Register" items={REGISTER_ITEMS} /></li>
        </ul>

        <div className="nav-right">
          <button className="lang-btn">EN / AR</button>
          <Link to="/login" className="btn-primary">Login</Link>
        </div>

      </div>
    </nav>
  );
}
