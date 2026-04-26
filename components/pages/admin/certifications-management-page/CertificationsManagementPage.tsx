"use client"

import { AdminCatalogManagementPage } from "../shared/AdminCatalogManagementPage"
import {
  createCertification,
  deleteCertification,
  getCertifications,
  updateCertification,
} from "@/services/api/taxonomy.service"

export function CertificationsManagementPage() {
  return (
    <AdminCatalogManagementPage
      icon="solar:verified-check-bold"
      titleEn="Certifications Management"
      titleAr="إدارة الشهادات"
      descriptionEn="Manage certification catalog entries available across the platform."
      descriptionAr="إدارة عناصر الشهادات المتاحة عبر المنصة."
      entityPluralEn="Certifications"
      entityPluralAr="الشهادات"
      entitySingularEn="Certification"
      entitySingularAr="شهادة"
      listItems={getCertifications}
      createItem={createCertification}
      updateItem={updateCertification}
      deleteItem={deleteCertification}
    />
  )
}
