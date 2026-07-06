import { useState } from "react";
import { Check, RotateCcw, Save, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { PERMISSION_LABELS, ROLE_LABELS, ROLE_PERMISSIONS, saveRolePermissions } from "@/constants/rbac";
import type { Permission, Role } from "@/types/rbac";

const roles = Object.keys(ROLE_LABELS) as Role[];
const permissions = Object.keys(PERMISSION_LABELS) as Permission[];
const groups: { label: string; permissions: Permission[] }[] = [
  { label: "Quản trị hệ thống", permissions: ["users:manage", "roles:manage", "settings:manage"] },
  { label: "Bãi đỗ xe", permissions: ["dashboard:view", "buildings:manage", "parkingInfo:view", "parkingEntry:create", "vehicleTypes:manage", "floors:manage", "slots:view", "slots:updateStatus", "slots:manage", "pricing:manage"] },
  { label: "Vận hành", permissions: ["checkin:create", "checkout:create", "sessions:view", "sessions:manage", "exceptions:manage", "currentSession:view", "reservations:selfManage", "payments:pay", "payments:collect", "feedback:create"] },
  { label: "Báo cáo và phân tích", permissions: ["reports:view", "ai:view"] }
];

export function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<Role>(roles[0]);
  const [draft, setDraft] = useState<Record<Role, Permission[]>>(() =>
    Object.fromEntries(roles.map((role) => [role, [...ROLE_PERMISSIONS[role]]])) as Record<Role, Permission[]>
  );
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const selected = draft[selectedRole];
  const query = search.trim().toLowerCase();
  const isDirty = (role: Role) => permissions.some((permission) => draft[role].includes(permission) !== ROLE_PERMISSIONS[role].includes(permission));

  const update = (next: Permission[]) => {
    setSaved(false);
    setDraft((current) => ({ ...current, [selectedRole]: next }));
  };
  const toggle = (permission: Permission) => update(selected.includes(permission) ? selected.filter((item) => item !== permission) : [...selected, permission]);
  const toggleGroup = (items: Permission[]) => update(items.every((item) => selected.includes(item)) ? selected.filter((item) => !items.includes(item)) : Array.from(new Set([...selected, ...items])));
  const save = () => {
    saveRolePermissions(selectedRole, selected);
    setDraft((current) => ({ ...current, [selectedRole]: [...selected] }));
    setSaved(true);
  };

  const visibleGroups = groups.map((group) => ({
    ...group,
    permissions: group.permissions.filter((permission) => !query || PERMISSION_LABELS[permission].toLowerCase().includes(query) || permission.toLowerCase().includes(query))
  })).filter((group) => group.permissions.length);

  return <>
    <PageHeader title="Phân quyền" description="Quản lý quyền truy cập theo từng vai trò trong hệ thống." />
    <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="lg:sticky lg:top-20">
        <CardHeader title="Danh sách vai trò" />
        <CardContent className="grid gap-2">
          {roles.map((role) => <button key={role} type="button" onClick={() => { setSelectedRole(role); setSaved(false); }} className={`flex items-center justify-between rounded-lg border px-3 py-3 text-left transition ${selectedRole === role ? "border-primary bg-blue-50 text-primary ring-1 ring-primary/20" : "border-border hover:bg-slate-50"}`}>
            <span><span className="block text-sm font-semibold">{ROLE_LABELS[role]}</span><span className="text-xs text-slate-500">{draft[role].length}/{permissions.length} quyền</span></span>
            {isDirty(role) ? <span className="h-2.5 w-2.5 rounded-full bg-amber-500" title="Có thay đổi chưa lưu" /> : <ShieldCheck size={17} className="text-slate-400" />}
          </button>)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={`Quyền của ${ROLE_LABELS[selectedRole]}`} action={isDirty(selectedRole) ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">● Chưa lưu</span> : saved ? <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check size={16} /> Đã lưu</span> : null} />
        <div className="flex flex-col gap-3 border-b border-border bg-slate-50 px-5 py-4 sm:flex-row sm:justify-between">
          <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm quyền..." className="h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100" /></div>
          <div className="flex gap-2"><Button variant="secondary" className="h-10" onClick={() => update(permissions)}>Chọn tất cả</Button><Button variant="ghost" className="h-10" onClick={() => update([])}>Bỏ tất cả</Button></div>
        </div>
        <CardContent className="grid gap-5">
          {visibleGroups.map((group) => {
            const count = group.permissions.filter((permission) => selected.includes(permission)).length;
            const all = count === group.permissions.length;
            return <section key={group.label} className="overflow-hidden rounded-lg border border-border">
              <div className="flex items-center justify-between border-b border-border bg-slate-50 px-4 py-3"><div><h3 className="text-sm font-semibold">{group.label}</h3><p className="text-xs text-slate-500">Đã chọn {count}/{group.permissions.length}</p></div><button type="button" onClick={() => toggleGroup(group.permissions)} className="text-xs font-semibold text-primary">{all ? "Bỏ chọn nhóm" : "Chọn cả nhóm"}</button></div>
              <div className="grid sm:grid-cols-2">{group.permissions.map((permission) => <label key={permission} className={`flex cursor-pointer items-center gap-3 border-b border-border p-4 ${selected.includes(permission) ? "bg-blue-50/60" : "hover:bg-slate-50"}`}><input type="checkbox" checked={selected.includes(permission)} onChange={() => toggle(permission)} className="h-4 w-4 rounded border-slate-300 text-primary" /><span className="text-sm font-medium text-slate-700">{PERMISSION_LABELS[permission]}</span></label>)}</div>
            </section>;
          })}
          {!visibleGroups.length && <div className="py-10 text-center text-sm text-slate-500">Không tìm thấy quyền phù hợp với “{search}”.</div>}
        </CardContent>
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-white/95 px-5 py-4 backdrop-blur"><p className="text-sm text-slate-500">Đã chọn <strong className="text-slate-800">{selected.length}/{permissions.length}</strong> quyền</p><div className="flex gap-2"><Button variant="secondary" onClick={() => update([...ROLE_PERMISSIONS[selectedRole]])} disabled={!isDirty(selectedRole)}><RotateCcw size={16} /> Hoàn tác</Button><Button onClick={save} disabled={!isDirty(selectedRole)}><Save size={17} /> Lưu thay đổi</Button></div></div>
      </Card>
    </div>
  </>;
}
