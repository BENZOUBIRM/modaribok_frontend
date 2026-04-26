"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"

import { useAuth } from "@/providers/auth-provider"
import { useDictionary } from "@/providers/dictionary-provider"
import type {
  MultilingualNameEntity,
  MultilingualNamePayload,
} from "@/services/api/taxonomy.service"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/primitives/table"

interface CrudResult<T> {
  success: boolean
  data?: T
  code?: string
}

interface AdminCatalogManagementPageProps {
  icon: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  entityPluralEn: string
  entityPluralAr: string
  entitySingularEn: string
  entitySingularAr: string
  listItems: () => Promise<CrudResult<MultilingualNameEntity[]>>
  createItem: (payload: MultilingualNamePayload) => Promise<CrudResult<MultilingualNameEntity>>
  updateItem: (id: number, payload: MultilingualNamePayload) => Promise<CrudResult<MultilingualNameEntity>>
  deleteItem: (id: number) => Promise<CrudResult<void>>
}

type FormState = {
  nameAr: string
  nameFr: string
  nameEn: string
}

const EMPTY_FORM: FormState = {
  nameAr: "",
  nameFr: "",
  nameEn: "",
}

type SortField = "id" | "nameAr" | "nameFr" | "nameEn"
type SortDirection = "asc" | "desc"

function normalizeSearchValue(value: string | number | null | undefined): string {
  if (typeof value === "number") {
    return String(value)
  }

  return (value ?? "").toLowerCase().trim()
}

export function AdminCatalogManagementPage({
  icon,
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  entityPluralEn,
  entityPluralAr,
  entitySingularEn,
  entitySingularAr,
  listItems,
  createItem,
  updateItem,
  deleteItem,
}: AdminCatalogManagementPageProps) {
  const { lang, isRTL } = useDictionary()
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()
  const router = useRouter()

  const [rows, setRows] = React.useState<MultilingualNameEntity[]>([])
  const [isPageLoading, setIsPageLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [errorCode, setErrorCode] = React.useState<string | null>(null)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<MultilingualNameEntity | null>(null)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortField, setSortField] = React.useState<SortField>("id")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const formId = React.useId()

  const isArabic = lang === "ar"
  const title = isArabic ? titleAr : titleEn
  const description = isArabic ? descriptionAr : descriptionEn
  const entityPlural = isArabic ? entityPluralAr : entityPluralEn
  const entitySingular = isArabic ? entitySingularAr : entitySingularEn

  const labels = isArabic
    ? {
        listTitle: `قائمة ${entityPlural}`,
        formTitleCreate: `إضافة ${entitySingular}`,
        formTitleUpdate: `تحديث ${entitySingular}`,
        nameAr: "الاسم بالعربية",
        nameFr: "الاسم بالفرنسية",
        nameEn: "الاسم بالإنجليزية",
        id: "المعرف",
        operations: "العمليات",
        create: "إضافة",
        update: "تحديث",
        cancel: "إلغاء",
        edit: "تعديل",
        delete: "حذف",
        loading: "جاري التحميل...",
        noData: "لا توجد بيانات حاليا.",
        oneNameRequired: "يجب إدخال اسم واحد على الأقل (عربي أو فرنسي أو إنجليزي).",
        deleteTitle: `حذف ${entitySingular}؟`,
        deleteMessage: "لا يمكن التراجع عن هذا الإجراء.",
        searchPlaceholder: "ابحث بالمعرف أو الاسم...",
      }
    : {
        listTitle: `${entityPlural} List`,
        formTitleCreate: `Create ${entitySingular}`,
        formTitleUpdate: `Update ${entitySingular}`,
        nameAr: "Name AR",
        nameFr: "Name FR",
        nameEn: "Name EN",
        id: "ID",
        operations: "Operations",
        create: "Create",
        update: "Update",
        cancel: "Cancel",
        edit: "Update",
        delete: "Delete",
        loading: "Loading...",
        noData: "No data found.",
        oneNameRequired: "Provide at least one name (Arabic, French, or English).",
        deleteTitle: `Delete ${entitySingular}?`,
        deleteMessage: "This action cannot be undone.",
        searchPlaceholder: "Search by id or name...",
      }

  const visibleRows = React.useMemo(() => {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim()

    const filteredRows = normalizedSearchTerm
      ? rows.filter((item) => {
          const candidates = [item.id, item.nameAr, item.nameFr, item.nameEn]
          return candidates.some((candidate) => normalizeSearchValue(candidate).includes(normalizedSearchTerm))
        })
      : rows

    return [...filteredRows].sort((first, second) => {
      let comparison = 0

      if (sortField === "id") {
        comparison = first.id - second.id
      } else {
        const firstValue = normalizeSearchValue(first[sortField])
        const secondValue = normalizeSearchValue(second[sortField])
        comparison = firstValue.localeCompare(secondValue, undefined, { sensitivity: "base" })
      }

      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [rows, searchTerm, sortDirection, sortField])

  const shouldRedirect = !isAuthLoading && (!isAuthenticated || !user || user.role !== "ADMIN")
  const nameArInputId = `${formId}-name-ar`
  const nameFrInputId = `${formId}-name-fr`
  const nameEnInputId = `${formId}-name-en`

  const handleSortByField = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
      return
    }

    setSortField(field)
    setSortDirection("asc")
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <Icon icon="solar:sort-linear" className="size-3.5 opacity-60" />
    }

    return sortDirection === "asc"
      ? <Icon icon="solar:alt-arrow-up-linear" className="size-3.5" />
      : <Icon icon="solar:alt-arrow-down-linear" className="size-3.5" />
  }

  const formInputClassName = "bg-muted/90 dark:bg-zinc-700/50"

  React.useEffect(() => {
    if (shouldRedirect) {
      router.replace(`/${lang}`)
    }
  }, [lang, router, shouldRedirect])

  const loadRows = React.useCallback(async () => {
    const result = await listItems()

    if (!result.success) {
      setErrorCode(result.code ?? "NETWORK_ERROR")
      setRows([])
      return
    }

    setErrorCode(null)
    setRows(result.data ?? [])
  }, [listItems])

  React.useEffect(() => {
    let isActive = true

    const run = async () => {
      setIsPageLoading(true)
      const result = await listItems()

      if (!isActive) {
        return
      }

      if (!result.success) {
        setErrorCode(result.code ?? "NETWORK_ERROR")
        setRows([])
        setIsPageLoading(false)
        return
      }

      setErrorCode(null)
      setRows(result.data ?? [])
      setIsPageLoading(false)
    }

    if (!shouldRedirect) {
      void run()
    }

    return () => {
      isActive = false
    }
  }, [listItems, shouldRedirect])

  const setField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const startEdit = (item: MultilingualNameEntity) => {
    setFormError(null)
    setEditingId(item.id)
    setForm({
      nameAr: item.nameAr ?? "",
      nameFr: item.nameFr ?? "",
      nameEn: item.nameEn ?? "",
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormError(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const payload: MultilingualNamePayload = {
      nameAr: form.nameAr.trim() || undefined,
      nameFr: form.nameFr.trim() || undefined,
      nameEn: form.nameEn.trim() || undefined,
    }

    const hasAnyName = Boolean(payload.nameAr || payload.nameFr || payload.nameEn)
    if (!hasAnyName) {
      setFormError(labels.oneNameRequired)
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    const result = editingId
      ? await updateItem(editingId, payload)
      : await createItem(payload)

    setIsSubmitting(false)

    if (!result.success) {
      setErrorCode(result.code ?? "NETWORK_ERROR")
      return
    }

    setErrorCode(null)

    if (!result.data) {
      await loadRows()
      resetForm()
      return
    }

    if (editingId) {
      setRows((current) => current.map((item) => (item.id === editingId ? result.data! : item)))
    } else {
      setRows((current) => [...current, result.data!])
    }

    resetForm()
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deletingId) {
      return
    }

    setDeletingId(deleteTarget.id)
    const result = await deleteItem(deleteTarget.id)
    setDeletingId(null)

    if (!result.success) {
      setErrorCode(result.code ?? "NETWORK_ERROR")
      return
    }

    setRows((current) => current.filter((item) => item.id !== deleteTarget.id))

    if (editingId === deleteTarget.id) {
      resetForm()
    }

    setDeleteTarget(null)
  }

  if (isAuthLoading || shouldRedirect) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6" dir={isRTL ? "rtl" : "ltr"}>
      <section className="rounded-3xl border border-border/30 bg-card p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:border-zinc-700 dark:shadow-[0_8px_24px_rgba(0,0,0,0.18)] md:p-6">
        <div className="mb-6 space-y-2">
          <h1 className={`inline-flex items-center gap-2 text-2xl font-bold text-foreground ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <Icon icon={icon} className="size-6 text-primary" />
            <span>{title}</span>
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {errorCode ? (
          <div className="mb-4">
            <Callout variant="error" title={isArabic ? "خطأ" : "Error"}>
              {errorCode}
            </Callout>
          </div>
        ) : null}

        <div className="mb-6 rounded-2xl border border-border/30 bg-muted/65 p-4 dark:bg-zinc-800/30 md:p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            {editingId ? labels.formTitleUpdate : labels.formTitleCreate}
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor={nameArInputId} className="text-xs font-medium text-muted-foreground">{labels.nameAr}</label>
                <Input
                  id={nameArInputId}
                  value={form.nameAr}
                  onChange={(event) => setField("nameAr", event.target.value)}
                  dir="rtl"
                  placeholder={labels.nameAr}
                  className={formInputClassName}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor={nameFrInputId} className="text-xs font-medium text-muted-foreground">{labels.nameFr}</label>
                <Input
                  id={nameFrInputId}
                  value={form.nameFr}
                  onChange={(event) => setField("nameFr", event.target.value)}
                  dir="ltr"
                  placeholder={labels.nameFr}
                  className={formInputClassName}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor={nameEnInputId} className="text-xs font-medium text-muted-foreground">{labels.nameEn}</label>
                <Input
                  id={nameEnInputId}
                  value={form.nameEn}
                  onChange={(event) => setField("nameEn", event.target.value)}
                  dir="ltr"
                  placeholder={labels.nameEn}
                  className={formInputClassName}
                />
              </div>
            </div>

            {formError ? (
              <p className="text-sm font-medium text-destructive">{formError}</p>
            ) : null}

            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse justify-start" : "justify-start"}`}>
              <Button
                type="submit"
                loading={isSubmitting}
                className={editingId
                  ? "min-w-30 border-amber-500/60 bg-amber-500/85 text-amber-950 hover:border-amber-500 hover:bg-amber-500 dark:border-amber-400/55 dark:bg-amber-400/85 dark:text-amber-950 dark:hover:bg-amber-400"
                  : "min-w-30"
                }
                startIcon={<Icon icon={editingId ? "solar:pen-2-linear" : "solar:add-circle-linear"} className="size-4" />}
              >
                {editingId ? labels.update : labels.create}
              </Button>

              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  {labels.cancel}
                </Button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">{labels.listTitle}</h2>

          <div className="rounded-xl border border-border/30 bg-muted/30 p-3 dark:bg-zinc-900/20">
            <div className="w-full md:flex-1">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={labels.searchPlaceholder}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
          </div>

          {isPageLoading ? (
            <div className="flex min-h-56 items-center justify-center rounded-xl border border-border/30 bg-muted/20">
              <Spinner className="size-9" />
            </div>
          ) : (
            <div className="rounded-xl border border-border/35 bg-card">
              <Table bordered>
                <TableHeader bgColor="bg-muted/65 dark:bg-zinc-800/75">
                  <TableRow>
                    <TableHead className="font-bold">
                      <button
                        type="button"
                        onClick={() => handleSortByField("id")}
                        className="inline-flex cursor-pointer items-center gap-1 text-left text-inherit transition-colors hover:text-primary"
                      >
                        <span>{labels.id}</span>
                        {getSortIcon("id")}
                      </button>
                    </TableHead>
                    <TableHead className="font-bold">
                      <button
                        type="button"
                        onClick={() => handleSortByField("nameAr")}
                        className="inline-flex cursor-pointer items-center gap-1 text-left text-inherit transition-colors hover:text-primary"
                      >
                        <span>{labels.nameAr}</span>
                        {getSortIcon("nameAr")}
                      </button>
                    </TableHead>
                    <TableHead className="font-bold">
                      <button
                        type="button"
                        onClick={() => handleSortByField("nameFr")}
                        className="inline-flex cursor-pointer items-center gap-1 text-left text-inherit transition-colors hover:text-primary"
                      >
                        <span>{labels.nameFr}</span>
                        {getSortIcon("nameFr")}
                      </button>
                    </TableHead>
                    <TableHead className="font-bold">
                      <button
                        type="button"
                        onClick={() => handleSortByField("nameEn")}
                        className="inline-flex cursor-pointer items-center gap-1 text-left text-inherit transition-colors hover:text-primary"
                      >
                        <span>{labels.nameEn}</span>
                        {getSortIcon("nameEn")}
                      </button>
                    </TableHead>
                    <TableHead className="font-bold text-center">{labels.operations}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {visibleRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        {labels.noData}
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleRows.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-semibold text-foreground">{item.id}</TableCell>
                        <TableCell dir="rtl" className="text-right">{item.nameAr || "-"}</TableCell>
                        <TableCell dir="ltr">{item.nameFr || "-"}</TableCell>
                        <TableCell dir="ltr">{item.nameEn || "-"}</TableCell>
                        <TableCell>
                          <div className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-500/20 dark:border-amber-400/45 dark:bg-amber-400/15 dark:text-amber-300 dark:hover:bg-amber-400/25"
                              aria-label={labels.edit}
                              title={labels.edit}
                            >
                              <Icon icon="solar:pen-2-linear" className="size-3.5" />
                              <span>{labels.edit}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-destructive/45 bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
                              aria-label={labels.delete}
                              title={labels.delete}
                            >
                              <Icon icon="solar:trash-bin-trash-linear" className="size-3.5" />
                              <span>{labels.delete}</span>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => (!open ? setDeleteTarget(null) : undefined)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-orange-500/10">
              <Icon icon="solar:danger-triangle-bold" className="size-8 text-orange-500" />
            </AlertDialogMedia>
            <AlertDialogTitle>{labels.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{labels.deleteMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{labels.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="inline-flex items-center gap-2"
            >
              {deletingId ? <Spinner className="size-4" /> : null}
              {labels.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
