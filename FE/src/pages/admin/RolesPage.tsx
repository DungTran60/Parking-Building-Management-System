import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/constants/rbac";
import type { Permission, Role } from "@/types/rbac";

const permissions = Array.from(new Set(Object.values(ROLE_PERMISSIONS).flat())) as Permission[];

export function RolesPage() {
  const roles = Object.keys(ROLE_LABELS) as Role[];
  return (
    <>
      <PageHeader title="Phân quyền" description="Permission Matrix cho System Administrator, Parking Manager, Parking Staff và Parking User." />
      <Card>
        <CardHeader title="Role Management" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr><th className="p-3 text-left">Permission</th>{roles.map((role) => <th key={role} className="p-3 text-left">{ROLE_LABELS[role]}</th>)}</tr></thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission} className="border-t border-border">
                    <td className="p-3 font-medium">{permission}</td>
                    {roles.map((role) => <td key={role} className="p-3">{ROLE_PERMISSIONS[role].includes(permission) && <Check className="text-emerald-600" size={18} />}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
