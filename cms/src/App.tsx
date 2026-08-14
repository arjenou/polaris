import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import PostList from "./pages/PostList";
import PostEditor from "./pages/PostEditor";
import Account from "./pages/Account";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, username } = useAuth();
  if (loading) return <div className="loading-screen">加载中…</div>;
  if (!username) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/news" replace />} />
        <Route path="news" element={<PostList resource="news" />} />
        <Route path="news/new" element={<PostEditor resource="news" mode="create" />} />
        <Route path="news/:id/edit" element={<PostEditor resource="news" mode="edit" />} />
        <Route path="recommended" element={<PostList resource="recommended" />} />
        <Route path="recommended/new" element={<PostEditor resource="recommended" mode="create" />} />
        <Route path="recommended/:id/edit" element={<PostEditor resource="recommended" mode="edit" />} />
        <Route path="account" element={<Account />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
