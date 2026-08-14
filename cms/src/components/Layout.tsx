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
          <NavLink to="/recommended" className={({ isActive }) => (isActive ? "active" : "")}>
            推荐信息
          </NavLink>
          <NavLink to="/team" className={({ isActive }) => (isActive ? "active" : "")}>
            社员介绍
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => (isActive ? "active" : "")}>
            社内イベント
          </NavLink>
          <NavLink to="/page-galleries" className={({ isActive }) => (isActive ? "active" : "")}>
            页面图片管理
          </NavLink>
          <NavLink to="/page-advantages" className={({ isActive }) => (isActive ? "active" : "")}>
            选择理由管理
          </NavLink>
          <NavLink to="/group-companies" className={({ isActive }) => (isActive ? "active" : "")}>
            集团企业管理
          </NavLink>
          <NavLink to="/contact-submissions" className={({ isActive }) => (isActive ? "active" : "")}>
            咨询记录
          </NavLink>
          <NavLink to="/account" className={({ isActive }) => (isActive ? "active" : "")}>
            账号设置
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
