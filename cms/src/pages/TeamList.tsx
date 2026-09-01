import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { teamApi, type TeamMember } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { SkeletonTableRows } from "../components/Skeleton";

export default function TeamList() {
  const { showToast } = useToast();
  const [locale, setLocale] = useState<"ja" | "zh">("ja");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingPresident, setUpdatingPresident] = useState(false);

  function refresh() {
    setLoading(true);
    teamApi
      .list(locale)
      .then(setMembers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refresh, [locale]);

  const president = members.find((member) => member.isPresident);

  async function handleDelete(member: TeamMember) {
    if (!confirm(`确认删除「${member.lastName}${member.firstName}」？此操作不可撤销。`)) return;
    try {
      await teamApi.remove(member.id);
      showToast("删除成功");
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  async function handleVisibilityChange(member: TeamMember, published: boolean) {
    setUpdatingId(member.id);
    try {
      const updated = await teamApi.update(member.id, {
        locale: member.locale,
        lastName: member.lastName,
        firstName: member.firstName,
        lastNameKana: member.lastNameKana,
        firstNameKana: member.firstNameKana,
        department: member.department,
        position: member.position,
        description: member.description,
        tags: member.tags,
        languages: member.languages,
        imageKey: member.imageKey,
        imageWidth: member.imageWidth,
        imageHeight: member.imageHeight,
        isPresident: member.isPresident,
        published,
      });
      setMembers((current) => current.map((item) => (item.id === member.id ? updated : item)));
      showToast(published ? "已设为显示" : "已设为不显示");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "状态更新失败", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handlePresidentChange(memberId: string) {
    const nextId = memberId ? Number(memberId) : null;
    if (nextId === president?.id) return;
    setUpdatingPresident(true);
    try {
      await teamApi.setPresident(locale, nextId);
      setMembers((current) =>
        current.map((member) => ({
          ...member,
          isPresident: nextId !== null && member.id === nextId,
        })),
      );
      showToast(nextId ? "已设为社长" : "已取消社长设置");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "社长设置失败", "error");
      refresh();
    } finally {
      setUpdatingPresident(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>社员介绍</h1>
      </div>

      <div className="tabs-bar">
        <div className="tabs">
          <button className={locale === "ja" ? "active" : ""} onClick={() => setLocale("ja")}>
            日语
          </button>
          <button className={locale === "zh" ? "active" : ""} onClick={() => setLocale("zh")}>
            中文
          </button>
        </div>
        <Link to="/team/new" className="btn-primary">
          + 新建
        </Link>
      </div>

      <p className="hint">
        每个语言页面只能设置一位社长；社长在首页轮播中间首位固定展示，其余社员每次访问随机排序。
      </p>

      <div className="president-picker">
        <label>
          社长
          <select
            value={president?.id ?? ""}
            disabled={loading || updatingPresident || members.length === 0}
            onChange={(e) => handlePresidentChange(e.target.value)}
          >
            <option value="">— 未设置 —</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.lastName}{member.firstName}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}
      <table className="data-table team-table">
        <colgroup>
          <col className="col-avatar" />
          <col className="col-name" />
          <col className="col-role" />
          <col className="col-tags" />
          <col className="col-status" />
          <col className="col-count" />
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>头像</th>
            <th>姓名</th>
            <th>部门 / 职位</th>
            <th>标签</th>
            <th>显示</th>
            <th>咨询次数</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonTableRows columns={["thumb", "text-block", "text-block", "badge", "badge", "badge", "actions"]} />
          ) : (
            <>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt="" className="avatar-thumb" />
                  ) : (
                    <span className="avatar-placeholder" />
                  )}
                </td>
                <td>
                  <div className="member-name">
                    {member.lastName} {member.firstName}
                    {member.isPresident && <span className="president-badge">社长</span>}
                  </div>
                  {(member.lastNameKana || member.firstNameKana) && (
                    <div className="member-kana">
                      {member.lastNameKana} {member.firstNameKana}
                    </div>
                  )}
                </td>
                <td>
                  <div className="member-department">{member.department}</div>
                  {member.position && (
                    <div className="member-position">{member.position.replace(/^\/\s*/, "")}</div>
                  )}
                </td>
                <td className="tags-cell">
                  {member.tags.map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </td>
                <td>
                  <select
                    className={`visibility-select ${member.published ? "is-visible" : "is-hidden"}`}
                    value={member.published ? "visible" : "hidden"}
                    disabled={updatingId === member.id}
                    aria-label={`设置「${member.lastName}${member.firstName}」的显示状态`}
                    onChange={(e) => handleVisibilityChange(member, e.target.value === "visible")}
                  >
                    <option value="visible">显示</option>
                    <option value="hidden">不显示</option>
                  </select>
                </td>
                <td className="count-cell">
                  <span className="count-badge">{member.submissionCount}</span>
                </td>
                <td className="table-actions">
                  <Link to={`/team/${member.id}/edit`}>编辑</Link>
                  <button className="btn-link danger" onClick={() => handleDelete(member)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">
                  暂无数据
                </td>
              </tr>
            )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
