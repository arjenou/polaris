import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, accountApi, usersApi, type AdminUser } from "../lib/api";
import { isSuperAdmin, SUPER_ADMIN_USERNAME } from "../lib/adminRoles";
import { useAuth } from "../lib/AuthContext";
import { useToast } from "../lib/ToastContext";

export default function Account() {
  const { username: currentUsername } = useAuth();
  const navigate = useNavigate();
  const { showToast, showSuccessDialog } = useToast();

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [creatingUser, setCreatingUser] = useState(false);

  function refreshUsers() {
    setUsersLoading(true);
    usersApi
      .list()
      .then(setUsers)
      .catch((err) => setUsersError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setUsersLoading(false));
  }

  useEffect(refreshUsers, []);

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("两次输入的新密码不一致");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("新密码至少需要 8 位");
      return;
    }

    setChangingPassword(true);
    try {
      await accountApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setChangingPassword(false);
      showSuccessDialog("密码已修改，请重新登录", () => {
        navigate("/login", { replace: true });
        window.location.reload();
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "修改失败";
      setPasswordError(message);
      showToast(message, "error");
      setChangingPassword(false);
    }
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    setUsersError(null);

    if (newUser.username === SUPER_ADMIN_USERNAME) {
      setUsersError("admin 为主账号，不可重复创建");
      return;
    }

    setCreatingUser(true);
    try {
      await usersApi.create(newUser.username, newUser.password);
      setNewUser({ username: "", password: "" });
      showSuccessDialog("账号创建成功");
      refreshUsers();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "创建失败";
      setUsersError(message);
      showToast(message, "error");
    } finally {
      setCreatingUser(false);
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    if (!confirm(`确认删除账号「${user.username}」？`)) return;
    try {
      await usersApi.remove(user.id);
      showToast("账号删除成功");
      refreshUsers();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "删除失败";
      setUsersError(message);
      showToast(message, "error");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>账号设置</h1>
      </div>

      <section className="panel">
        <h2>修改我的密码</h2>
        <form className="editor-form" onSubmit={handleChangePassword}>
          <label>
            当前密码
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
              required
            />
          </label>
          <label>
            新密码（至少 8 位）
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
              minLength={8}
              required
            />
          </label>
          <label>
            确认新密码
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              minLength={8}
              required
            />
          </label>
          {passwordError && <p className="form-error">{passwordError}</p>}
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={changingPassword}>
              {changingPassword ? "提交中…" : "修改密码"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>管理员账号</h2>
        <p className="panel-note">admin 为主账号，拥有全部权限；其他账号仅可查看咨询记录。</p>

        {usersError && <p className="form-error">{usersError}</p>}
        {usersLoading ? (
          <p>加载中…</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>用户名</th>
                <th>创建时间</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.username}
                    {user.username === SUPER_ADMIN_USERNAME && <span className="badge-me">（主账号）</span>}
                    {user.username === currentUsername && user.username !== SUPER_ADMIN_USERNAME && (
                      <span className="badge-me">（我）</span>
                    )}
                  </td>
                  <td>{user.createdAt}</td>
                  <td className="table-actions">
                    {user.username !== currentUsername && !isSuperAdmin(user.username) && (
                      <button className="btn-link danger" onClick={() => handleDeleteUser(user)}>
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>新增管理员账号</h3>
        <form className="editor-form" onSubmit={handleCreateUser}>
          <div className="form-row">
            <label>
              用户名（3-32 位英文/数字/下划线/连字符）
              <input
                value={newUser.username}
                onChange={(e) => setNewUser((u) => ({ ...u, username: e.target.value }))}
                pattern="[a-zA-Z0-9_-]{3,32}"
                required
              />
            </label>
            <label>
              初始密码（至少 8 位）
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
                minLength={8}
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={creatingUser}>
              {creatingUser ? "创建中…" : "新增账号"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
