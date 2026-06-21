import { Link } from 'react-router-dom'
import logo from '../assets/logoBaby.png'

export default function Logo({ light = false }) {
  return (
    <Link to="/" className={`brand-logo ${light ? 'brand-logo-light' : ''}`} aria-label="Babycure home">
      <span className="brand-logo-crop">
        <img src={logo} alt="Babycure" loading="eager" />
      </span>
    </Link>
  )
}
