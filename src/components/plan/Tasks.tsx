"use client";

import { useState } from "react";
import { makeId } from "@/lib/schema";
import { addDays, isOverdue, PHASES, type PhaseId, type Task } from "@/lib/plan";
import { dotDate } from "@/lib/dates";
import { Bar, Empty, Ring, type PageProps } from "./ui";
import { Icon } from "./icons";
import { DatePicker } from "@/components/DatePicker";
import { confirmDelete, quote } from "@/components/ConfirmDialog";

type Filter = "all" | "todo" | "overdue";

const OWNERS = ["Cả hai", "Chú rể", "Cô dâu", "Nhà trai", "Nhà gái", "Hai nhà"];

export function Tasks({ inv, plan, setPlan, today }: PageProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [focusId, setFocusId] = useState("");
  // Mốc đã xong hết thì thu gọn; người dùng bấm để mở lại
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const done = plan.tasks.filter((t) => t.done).length;
  const overdue = plan.tasks.filter((t) => isOverdue(t, today)).length;

  const visible = (t: Task) => (filter === "todo" ? !t.done : filter === "overdue" ? isOverdue(t, today) : true);
  // Mốc hiện tại: mốc đầu tiên mà ngày của mốc chưa qua
  const currentPhase = PHASES.find((p) => addDays(inv.mainEvent.date, p.offset) >= today)?.id;

  // Việc chưa đặt tên (vừa bấm thêm) thì xóa luôn, không hỏi
  async function remove(t: Task) {
    if (t.title.trim() && !(await confirmDelete(`Xóa việc ${quote(t.title)}`, "Xóa xong là lưu luôn, không hoàn tác được."))) return;
    setPlan((p) => { p.tasks = p.tasks.filter((x) => x.id !== t.id); });
  }

  function add(phase: PhaseId) {
    const id = makeId();
    setPlan((p) => { p.tasks.push({ id, title: "", phase, due: "", owner: "", done: false }); });
    setOpened((o) => ({ ...o, [phase]: true }));
    setFocusId(id);
  }

  const sections = PHASES.map((ph) => {
    const items = plan.tasks.filter((t) => t.phase === ph.id);
    return { ph, items, shown: items.filter(visible), doneCount: items.filter((t) => t.done).length };
  }).filter((x) => filter === "all" || x.shown.length > 0);

  return (
    <>
      <section className="pl-panel pl-taskhead">
        <Ring value={done} max={plan.tasks.length} size={76} label="Tiến độ công việc" />
        <div className="pl-taskhead-text">
          <b>{done}/{plan.tasks.length} việc đã xong</b>
          <span className="hint">{overdue ? `${overdue} việc quá hạn cần làm ngay` : "Không có việc nào quá hạn"}</span>
        </div>
        <div className="pl-seg" role="group" aria-label="Lọc công việc">
          {([["all", "Tất cả"], ["todo", "Chưa xong"], ["overdue", `Quá hạn${overdue ? ` · ${overdue}` : ""}`]] as const).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>
      </section>
      <datalist id="pl-owners">{OWNERS.map((o) => <option key={o} value={o} />)}</datalist>

      {sections.length === 0 && <Empty title={filter === "overdue" ? "Không có việc quá hạn" : "Xong hết rồi"} />}

      <ol className="pl-timeline">
        {sections.map(({ ph, items, shown, doneCount }) => {
          const phaseDate = addDays(inv.mainEvent.date, ph.offset);
          const complete = items.length > 0 && doneCount === items.length;
          const isOpen = filter !== "all" || !complete || opened[ph.id];
          const state = complete ? "complete" : ph.id === currentPhase ? "current" : phaseDate < today ? "past" : "future";
          return (
            <li key={ph.id} className={`pl-phase ${state}`}>
              <span className="pl-node" aria-hidden="true">{complete ? <Icon name="check" size={14} /> : null}</span>
              <div className="pl-phase-card">
                <button type="button" className="pl-phase-h" aria-expanded={isOpen} onClick={() => setOpened((o) => ({ ...o, [ph.id]: !isOpen }))}>
                  <span>
                    <b>{ph.label}</b>
                    <small>{ph.offset === 0 ? dotDate(phaseDate) : `khoảng ${dotDate(phaseDate)}`}</small>
                    {state === "current" && <em className="pl-now">Đang ở mốc này</em>}
                  </span>
                  <span className="pl-phase-prog">
                    <small>{doneCount}/{items.length}</small>
                    <Bar value={doneCount} max={items.length} label={`Tiến độ ${ph.label}`} />
                  </span>
                </button>
                {isOpen && (
                  <>
                    <ul className="pl-tasks">
                      {shown.map((t) => {
                        const i = plan.tasks.findIndex((x) => x.id === t.id);
                        const late = isOverdue(t, today);
                        return (
                          <li key={t.id} className={`${t.done ? "done" : ""} ${late ? "late" : ""}`}>
                            <input type="checkbox" className="pl-cb" aria-label="Đã xong" checked={t.done} onChange={(e) => setPlan((p) => { p.tasks[i].done = e.target.checked; })} />
                            <input className="pl-in grow" value={t.title} placeholder="Tên việc" autoFocus={t.id === focusId} aria-label="Tên việc"
                              onChange={(e) => setPlan((p) => { p.tasks[i].title = e.target.value; })} />
                            <span className="pl-task-meta">
                              <input className="pl-in owner" value={t.owner} placeholder="Ai lo?" list="pl-owners" aria-label="Người phụ trách"
                                onChange={(e) => setPlan((p) => { p.tasks[i].owner = e.target.value; })} />
                              <DatePicker className="pl-in date" value={t.due} aria-label="Hạn" placeholder="Đặt hạn" clearable withWeekday={false} invalid={late}
                                marks={[{ date: inv.mainEvent.date, label: "Ngày cưới" }]} onChange={(v) => setPlan((p) => { p.tasks[i].due = v; })} />
                              <button type="button" className="pl-x" aria-label={`Xóa việc ${t.title}`} onClick={() => remove(t)}><Icon name="trash" size={16} /></button>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    {filter === "all" && <button type="button" className="pl-add" onClick={() => add(ph.id)}><Icon name="plus" size={16} />Thêm việc</button>}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
