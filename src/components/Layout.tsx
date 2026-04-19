import { Outlet } from "react-router-dom";
import Footer from "./Footer";

export function Layout() {
  return (
    <div className="app-layout">
      <div className="content">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}