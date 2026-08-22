import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { ContactUnreadProvider, useContactUnread } from "../lib/ContactUnreadContext";

function SidebarNav() {
  const { unreadCount, refresh } = useContactUnread();
  const location = useLocation();

  // Re-check the unread count on every navigation (e.g. coming back from a
  // detail page that just marked a submission as read) so the dot clears
  // without needing a page reload.
  useEffect(() => {
    refresh();
  }, [location.pathname, refresh]);

  return (
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
      <NavLink to="/home-hero" className={({ isActive }) => (isActive ? "active" : "")}>
        首页页面管理
      </NavLink>
      <NavLink to="/page-galleries" className={({ isActive }) => (isActive ? "active" : "")}>
        页面图片管理
      </NavLink>
      <NavLink to="/page-advantages" className={({ isActive }) => (isActive ? "active" : "")}>
        选择理由管理
      </NavLink>
      <NavLink to="/group-info" className={({ isActive }) => (isActive ? "active" : "")}>
        グループ情報 页面管理
      </NavLink>
      <NavLink to="/group-timeline" className={({ isActive }) => (isActive ? "active" : "")}>
        グループ沿革管理
      </NavLink>
      <NavLink to="/group-companies" className={({ isActive }) => (isActive ? "active" : "")}>
        集团企业管理
      </NavLink>
      <NavLink to="/contact-submissions" className={({ isActive }) => (isActive ? "active" : "")}>
        咨询记录
        {unreadCount > 0 && <span className="nav-dot" title={`${unreadCount} 条新咨询`} />}
      </NavLink>
      <NavLink to="/contact-qr" className={({ isActive }) => (isActive ? "active" : "")}>
        联系二维码
      </NavLink>
      <NavLink to="/account" className={({ isActive }) => (isActive ? "active" : "")}>
        账号设置
      </NavLink>
    </nav>
  );
}

export default function Layout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <ContactUnreadProvider>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-title">Polaris CMS</div>
          <SidebarNav />
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
    </ContactUnreadProvider>
  );
}
