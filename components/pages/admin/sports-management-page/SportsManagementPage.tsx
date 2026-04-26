"use client"

import { AdminCatalogManagementPage } from "../shared/AdminCatalogManagementPage"
import {
  createSport,
  deleteSport,
  getSports,
  updateSport,
} from "@/services/api/taxonomy.service"

export function SportsManagementPage() {
  return (
    <AdminCatalogManagementPage
      icon="solar:dumbbells-bold"
      titleEn="Sports Management"
      titleAr="إدارة الرياضات"
      descriptionEn="Manage sports catalog entries available across the platform."
      descriptionAr="إدارة عناصر الرياضات المتاحة عبر المنصة."
      entityPluralEn="Sports"
      entityPluralAr="الرياضات"
      entitySingularEn="Sport"
      entitySingularAr="رياضة"
      listItems={getSports}
      createItem={createSport}
      updateItem={updateSport}
      deleteItem={deleteSport}
    />
  )
}
