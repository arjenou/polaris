import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
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
        <Route path="team" element={<TeamList />} />
        <Route path="team/new" element={<TeamEditor mode="create" />} />
        <Route path="team/:id/edit" element={<TeamEditor mode="edit" />} />
        <Route path="events" element={<EventList />} />
        <Route path="events/new" element={<EventEditor mode="create" />} />
        <Route path="events/:id/edit" element={<EventEditor mode="edit" />} />
        <Route path="home-hero" element={<HomeHero />} />
        <Route path="page-galleries" element={<PageGalleries />} />
        <Route path="page-advantages" element={<PageAdvantagesList />} />
        <Route path="page-advantages/:pageKey/:locale/new" element={<PageAdvantageEditor mode="create" />} />
        <Route path="page-advantages/:pageKey/:locale/:id/edit" element={<PageAdvantageEditor mode="edit" />} />
        <Route path="group-info" element={<GroupInfo />} />
        <Route path="group-timeline" element={<GroupTimeline />} />
        <Route path="group-timeline/:locale/new" element={<GroupTimelineEditor mode="create" />} />
        <Route path="group-timeline/:locale/:id/edit" element={<GroupTimelineEditor mode="edit" />} />
        <Route path="group-companies" element={<GroupCompaniesList />} />
        <Route path="group-companies/:locale/:region/new" element={<GroupCompanyEditor mode="create" />} />
        <Route path="group-companies/:locale/:region/:id/edit" element={<GroupCompanyEditor mode="edit" />} />
        <Route path="contact-submissions" element={<ContactSubmissions />} />
        <Route path="contact-submissions/:id" element={<ContactSubmissionDetail />} />
        <Route path="contact-qr" element={<ContactQrSettings />} />
        <Route path="account" element={<Account />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
