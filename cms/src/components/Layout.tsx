import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function Layout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-title">Polaris CMS</div>
        <nav className="sidebar-nav">
          <NavLink to="/news" className={({ isActive }) => (isActive ? "active" : "")}>
            新闻公告
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">{username}</div>
          <button className="btn-link" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
