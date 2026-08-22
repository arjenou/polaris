import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { contactSubmissionsApi } from "./api";

interface ContactUnreadState {
  unreadCount: number;
  refresh: () => void;
}

const ContactUnreadContext = createContext<ContactUnreadState | null>(null);

/** Tracks how many /contact submissions are unread, so the sidebar dot and
 * the list page's per-row dots stay in sync without each page re-deriving
 * the count on its own. `refresh()` is called after the detail page marks
 * a submission as read, and on every route change (e.g. navigating back
 * from the detail page to the list). */
export function ContactUnreadProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    contactSubmissionsApi
      .unreadCount()
      .then((res) => setUnreadCount(res.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ContactUnreadContext.Provider value={{ unreadCount, refresh }}>{children}</ContactUnreadContext.Provider>
  );
}

export function useContactUnread(): ContactUnreadState {
  const ctx = useContext(ContactUnreadContext);
  if (!ctx) throw new Error("useContactUnread must be used within ContactUnreadProvider");
  return ctx;
}
