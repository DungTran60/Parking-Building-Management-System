import { useCallback, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Drawer } from "@/components/common/Drawer";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { DataTable } from "@/components/tables/DataTable";
import { useResourceMutations, useResources } from "@/hooks/useResources";
import type { ResourceApi } from "@/hooks/useResources";
import type { ResourceName } from "@/services/resourceService";
import { getApiErrorMessage } from "@/utils/apiError";

export type FieldConfig<T> = {
  key: keyof T;
  label: string;
  type?: "text" | "number" | "select" | "color";
  placeholder?: string;
  options?: { label: string; value: string }[];
  render?: (value: T[keyof T], row: T) => ReactNode;
  required?: boolean;
};

export function EntityManagement<T extends { id: string }>({
  title,
  description,
  resource,
  api,
  fields
}: {
  title: string;
  description: string;
  resource: ResourceName;
  api?: ResourceApi<T>;
  fields: FieldConfig<T>[];
}) {
  const { data = [], error: loadError, isError: isLoadError, isLoading, refetch } = useResources<T>(resource, api);
  const mutations = useResourceMutations<T>(resource, api);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  // const [detail, setDetail] = useState<T | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSubmitError = useCallback((error: unknown) => {
    setSubmitError(getApiErrorMessage(error, "Không thể lưu dữ liệu. Vui lòng thử lại."));
  }, []);

  const openCreateModal = useCallback(() => {
    setEditing(null);
    setSubmitError(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: T) => {
    setEditing(item);
    setSubmitError(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
    setSubmitError(null);
  }, []);

  const columns = useMemo<ColumnDef<T>[]>(
    () => [
      ...fields.map((field) => ({
        accessorKey: field.key as string,
        header: field.label,
        cell: ({ row }: { row: { original: T } }) => {
          const value = row.original[field.key];
          if (field.render) return field.render(value, row.original);
          if (String(field.key).toLowerCase().includes("status") || String(value).includes("_")) return <Badge value={String(value)} />;
          if (value === null || value === undefined || value === "") return "—";
          return String(Array.isArray(value) ? value.join(", ") : value);
        }
      })),
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="h-9 w-9 px-0"
              onClick={() => openEditModal(row.original)}
              aria-label="Chỉnh sửa"
              title="Chỉnh sửa"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              className="h-9 w-9 px-0 text-red-600"
              onClick={() => {
                setDeleteError(null);
                const confirmed = window.confirm("Bạn có chắc chắn muốn xóa bản ghi này? Hành động này không thể hoàn tác.");
                if (confirmed) {
                  mutations.remove.mutate(row.original.id, {
                    onError: (error) => setDeleteError(getApiErrorMessage(error, "Không thể xóa dữ liệu. Vui lòng thử lại."))
                  });
                }
              }}
              aria-label="Xóa"
              title="Xóa"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )
      }
    ],
    [fields, mutations.remove, openEditModal]
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      fields.map((field) => {
        const value = form.get(String(field.key));
        return [field.key, field.type === "number" ? Number(value) : value];
      })
    ) as Partial<T>;
    if (editing) {
      mutations.update.mutate(
        { id: editing.id, payload },
        { onSuccess: closeModal, onError: handleSubmitError }
      );
    } else {
      mutations.create.mutate(payload as Omit<T, "id">, {
        onSuccess: closeModal,
        onError: handleSubmitError
      });
    }
  };

  const isSaving = mutations.create.isPending || mutations.update.isPending;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <Button onClick={openCreateModal}>
            <Plus size={17} />
            Tạo mới
          </Button>
        }
      />
      <Card>
        <CardHeader title={isLoading ? "Đang tải..." : `${data.length} bản ghi`} />
        <CardContent>
          {isLoadError ? (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>{getApiErrorMessage(loadError, "Không thể tải dữ liệu. Vui lòng thử lại.")}</p>
              <Button variant="secondary" className="mt-3" onClick={() => void refetch()}>Thử lại</Button>
            </div>
          ) : (
            <>
              {deleteError && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{deleteError}</div>}
              <DataTable data={data} columns={columns} />
            </>
          )}
        </CardContent>
      </Card>
      <Modal open={modalOpen} title={editing ? `Cập nhật ${title}` : `Tạo ${title}`} onClose={closeModal}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          {fields.map((field) => (
            <Field key={String(field.key)} label={field.label}>
              {field.type === "select" ? (
                <Select name={String(field.key)} defaultValue={editing ? String(editing[field.key] ?? "") : field.options?.[0]?.value} required={field.required !== false}>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input name={String(field.key)} type={field.type ?? "text"} placeholder={field.placeholder} defaultValue={editing ? String(editing[field.key] ?? "") : ""} required={field.required !== false} />
              )}
            </Field>
          ))}
          {submitError && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 sm:col-span-2">
              {submitError}
            </div>
          )}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSaving}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </Modal>
      {/* <Drawer open={Boolean(detail)} title="Chi tiết" onClose={() => setDetail(null)}>
        <dl className="grid gap-3">
          {detail &&
            fields.map((field) => (
              <div key={String(field.key)} className="rounded-md bg-slate-50 p-3">
                <dt className="text-xs font-medium uppercase text-slate-500">{field.label}</dt>
                <dd className="mt-1 text-sm text-slate-900">{String(detail[field.key])}</dd>
              </div>
            ))}
        </dl>
      </Drawer> */}
    </>
  );
}
