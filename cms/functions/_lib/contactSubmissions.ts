import { fromSqliteDatetime } from "./newsValidation";

export interface ContactSubmissionRow {
  id: number;
  locale: string;
  member_id: number | null;
  member_last_name: string | null;
  member_first_name: string | null;
  name: string;
  furigana: string;
  email: string;
  phone: string;
  inquiry_type: string;
  message: string;
  contact_method: string;
  created_at: string;
  is_read: number;
}

export const CONTACT_SUBMISSION_SELECT = `SELECT cs.*, tm.last_name AS member_last_name, tm.first_name AS member_first_name
     FROM contact_submissions cs
     LEFT JOIN team_members tm ON tm.id = cs.member_id`;

export function toContactSubmissionApiShape(row: ContactSubmissionRow) {
  return {
    id: row.id,
    locale: row.locale,
    memberId: row.member_id,
    memberName: row.member_last_name ? `${row.member_last_name} ${row.member_first_name}` : null,
    name: row.name,
    furigana: row.furigana,
    email: row.email,
    phone: row.phone,
    inquiryType: row.inquiry_type,
    message: row.message,
    contactMethod: row.contact_method,
    createdAt: fromSqliteDatetime(row.created_at) ?? row.created_at,
    isRead: !!row.is_read,
  };
}
