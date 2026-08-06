import { NavLink } from "react-router-dom";

export function SubNav() {
  return (
    <div className="nav-2">
      <ul>
        <li><NavLink to="/voces">VOCES</NavLink></li>
        <li><NavLink to="/hitos">HITOS</NavLink></li>
        <li><NavLink to="/voluntarios-destacados">VOLUNTARIOS DESTACADOS</NavLink></li>
        <li><NavLink to="/empoderamiento-femenino">EMPODERAMIENTO FEMENINO</NavLink></li>
      </ul>
    </div>
  );
}
