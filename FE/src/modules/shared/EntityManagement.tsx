import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Drawer } from "@/components/common/Drawer";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { DataTable } from "@/components/tables/DataTable";
import { useResourceMutations, useResources } from "@/hooks/useResources";
import type { ResourceName } from "@/services/resourceService";

export type FieldConfig<T> = {
  key: keyof T;
  label: string;
  type?: "text" | "number" | "select" | "color";
  options?: { label: string; value: string }[];
  render?: (value: T[keyof T], row: T) => ReactNode;
};

export function EntityManagement<T extends { id: string }>({
  title,
  description,
  resource,
  fields
}: {
  title: string;
  description: string;
  resource: ResourceName;
  fields: FieldConfig<T>[];
}) {
  const { data = [], isLoading } = useResources<T>(resource);
  const mutations = useResourceMutations<T>(resource);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [detail, setDetail] = useState<T | null>(null);

  const columns = useMemo<ColumnDef<T>[]>(
    () => [
      ...fields.map((field) => ({
        accessorKey: field.key as string,
        header: field.label,
        cell: ({ row }: { row: { original: T } }) => {
          const value = row.original[field.key];
          if (field.render) return field.render(value, row.original);
          if (String(field.key).toLowerCase().includes("status") || String(value).includes("_")) return <Badge value={String(value)} />;
          return String(Array.isArray(value) ? value.join(", ") : value);
        }
      })),
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="h-9 w-9 px-0" onClick={() => setDetail(row.original)} aria-label="Chi tiết">
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              className="h-9 w-9 px-0"
              onClick={() => {
                setEditing(row.original);
                setModalOpen(true);
              }}
              aria-label="Sửa"
            >
              <Pencil size={16} />
            </Button>
            <Button variant="ghost" className="h-9 w-9 px-0 text-red-600" onClick={() => mutations.remove.mutate(row.original.id)} aria-label="Xóa">
              <Trash2 size={16} />
            </Button>
          </div>
        )
      }
    ],
    [fields, mutations.remove]
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      fields.map((field) => {
        const value = form.get(String(field.key));
        return [field.key, field.type === "number" ? Number(value) : value];
      })
    ) as Partial<T>;
    if (editing) mutations.update.mutate({ id: editing.id, payload });
    else mutations.create.mutate(payload as Omit<T, "id">);
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={17} />
            Tạo mới
          </Button>
        }
      />
      <Card>
        <CardHeader title={isLoading ? "Đang tải..." : `${data.length} bản ghi`} />
        <CardContent>
          <DataTable data={data} columns={columns} />
        </CardContent>
      </Card>
      <Modal open={modalOpen} title={editing ? `Cập nhật ${title}` : `Tạo ${title}`} onClose={() => setModalOpen(false)}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          {fields.map((field) => (
            <Field key={String(field.key)} label={field.label}>
              {field.type === "select" ? (
                <Select name={String(field.key)} defaultValue={editing ? String(editing[field.key]) : field.options?.[0]?.value}>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input name={String(field.key)} type={field.type ?? "text"} defaultValue={editing ? String(editing[field.key]) : ""} required />
              )}
            </Field>
          ))}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </Modal>
      <Drawer open={Boolean(detail)} title="Chi tiết" onClose={() => setDetail(null)}>
        <dl className="grid gap-3">
          {detail &&
            fields.map((field) => (
              <div key={String(field.key)} className="rounded-md bg-slate-50 p-3">
                <dt className="text-xs font-medium uppercase text-slate-500">{field.label}</dt>
                <dd className="mt-1 text-sm text-slate-900">{String(detail[field.key])}</dd>
              </div>
            ))}
        </dl>
      </Drawer>
    </>
  );
}
