import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import { getDefaultAdminRoute } from "./lib/adminRoles";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import PostList from "./pages/PostList";
import PostEditor from "./pages/PostEditor";
import TeamList from "./pages/TeamList";
import TeamEditor from "./pages/TeamEditor";
import EventList from "./pages/EventList";
import EventEditor from "./pages/EventEditor";
import HomeHero from "./pages/HomeHero";
import PageGalleries from "./pages/PageGalleries";
import PageAdvantagesList from "./pages/PageAdvantagesList";
import PageAdvantageEditor from "./pages/PageAdvantageEditor";
import GroupCompaniesList from "./pages/GroupCompaniesList";
import GroupCompanyEditor from "./pages/GroupCompanyEditor";
import GroupInfo from "./pages/GroupInfo";
import GroupTimeline from "./pages/GroupTimeline";
import GroupTimelineEditor from "./pages/GroupTimelineEditor";
import ContactSubmissions from "./pages/ContactSubmissions";
import ContactSubmissionDetail from "./pages/ContactSubmissionDetail";
import ContactQrSettings from "./pages/ContactQrSettings";
import MaintenancePageSettings from "./pages/MaintenancePageSettings";
import Account from "./pages/Account";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, username } = useAuth();
  if (loading) return <div className="loading-screen">加载中…</div>;
  if (!username) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { loading, isSuperAdmin } = useAuth();
  if (loading) return <div className="loading-screen">加载中…</div>;
  if (!isSuperAdmin) return <Navigate to="/contact-submissions" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { loading, username } = useAuth();
  if (loading) return <div className="loading-screen">加载中…</div>;
  return <Navigate to={getDefaultAdminRoute(username)} replace />;
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
        <Route index element={<HomeRedirect />} />
        <Route
          path="news"
          element={
            <RequireSuperAdmin>
              <PostList resource="news" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="news/new"
          element={
            <RequireSuperAdmin>
              <PostEditor resource="news" mode="create" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="news/:id/edit"
          element={
            <RequireSuperAdmin>
              <PostEditor resource="news" mode="edit" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="recommended"
          element={
            <RequireSuperAdmin>
              <PostList resource="recommended" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="recommended/new"
          element={
            <RequireSuperAdmin>
              <PostEditor resource="recommended" mode="create" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="recommended/:id/edit"
          element={
            <RequireSuperAdmin>
              <PostEditor resource="recommended" mode="edit" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="team"
          element={
            <RequireSuperAdmin>
              <TeamList />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="team/new"
          element={
            <RequireSuperAdmin>
              <TeamEditor mode="create" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="team/:id/edit"
          element={
            <RequireSuperAdmin>
              <TeamEditor mode="edit" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="events"
          element={
            <RequireSuperAdmin>
              <EventList />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="events/new"
          element={
            <RequireSuperAdmin>
              <EventEditor mode="create" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="events/:id/edit"
          element={
            <RequireSuperAdmin>
              <EventEditor mode="edit" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="home-hero"
          element={
            <RequireSuperAdmin>
              <HomeHero />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="page-galleries"
          element={
            <RequireSuperAdmin>
              <PageGalleries />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="page-advantages"
          element={
            <RequireSuperAdmin>
              <PageAdvantagesList />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="page-advantages/:pageKey/:locale/new"
          element={
            <RequireSuperAdmin>
              <PageAdvantageEditor mode="create" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="page-advantages/:pageKey/:locale/:id/edit"
          element={
            <RequireSuperAdmin>
              <PageAdvantageEditor mode="edit" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="group-info"
          element={
            <RequireSuperAdmin>
              <GroupInfo />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="group-timeline"
          element={
            <RequireSuperAdmin>
              <GroupTimeline />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="group-timeline/:locale/new"
          element={
            <RequireSuperAdmin>
              <GroupTimelineEditor mode="create" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="group-timeline/:locale/:id/edit"
          element={
            <RequireSuperAdmin>
              <GroupTimelineEditor mode="edit" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="group-companies"
          element={
            <RequireSuperAdmin>
              <GroupCompaniesList />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="group-companies/:locale/:region/new"
          element={
            <RequireSuperAdmin>
              <GroupCompanyEditor mode="create" />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="group-companies/:locale/:region/:id/edit"
          element={
            <RequireSuperAdmin>
              <GroupCompanyEditor mode="edit" />
            </RequireSuperAdmin>
          }
        />
        <Route path="contact-submissions" element={<ContactSubmissions />} />
        <Route path="contact-submissions/:id" element={<ContactSubmissionDetail />} />
        <Route
          path="contact-qr"
          element={
            <RequireSuperAdmin>
              <ContactQrSettings />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="maintenance-page"
          element={
            <RequireSuperAdmin>
              <MaintenancePageSettings />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="account"
          element={
            <RequireSuperAdmin>
              <Account />
            </RequireSuperAdmin>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
