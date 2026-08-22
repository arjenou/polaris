import { useEffect, useState, type DragEvent } from "react";
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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setMembers((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  }

  async function handleDragEnd() {
    if (dragIndex === null) return;
    setDragIndex(null);
    try {
      await teamApi.reorder(locale, members.map((m) => m.id));
      showToast("排序已保存");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "排序保存失败", "error");
      refresh();
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

      <p className="hint">拖动左侧手柄可调整首页轮播中的显示顺序（拖动后自动保存）。</p>

      {error && <p className="form-error">{error}</p>}
      <table className="data-table team-table">
        <colgroup>
          <col className="col-drag" />
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
            <th />
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
            <SkeletonTableRows
              columns={["drag", "thumb", "text-block", "text-block", "badge", "badge", "badge", "actions"]}
            />
          ) : (
            <>
            {members.map((member, index) => (
              <tr
                key={member.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={dragIndex === index ? "dragging-row" : ""}
              >
                <td className="drag-handle" title="拖动排序">
                  ⠿
                </td>
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
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
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
                <td colSpan={8} className="empty-row">
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
