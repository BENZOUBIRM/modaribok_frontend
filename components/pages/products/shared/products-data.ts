export interface ProductData {
  id: number
  nameAr: string
  nameEn: string
  priceAr: string
  priceEn: string
  descriptionAr: string
  descriptionEn: string
  detailDescriptionAr: string
  detailDescriptionEn: string
  categoryAr: string
  categoryEn: string
  ratingAr: string
  ratingEn: string
  ratingDetailAr: string
  ratingDetailEn: string
  soldAr: string
  soldEn: string
  stockAr: string
  stockEn: string
  soldProductsAr: string
  soldProductsEn: string
  likesLabel: string
  discountPercentage?: number
  galleryImages: string[]
}

export const DEFAULT_PRODUCT_IMAGE = "/images/default-user.jpg"

const PRODUCT_GALLERY_A = [
  "/images/default-user.jpg",
  "/images/default-user-1.png",
  "/images/man-running.png",
  "/images/logo-cropped.png",
  "/images/logo.png",
  "/images/default-user.jpg",
]

const PRODUCT_GALLERY_B = [
  "/images/default-user-1.png",
  "/images/default-user.jpg",
  "/images/logo-cropped.png",
  "/images/man-running.png",
  "/images/logo.png",
  "/images/default-user-1.png",
]

export const PRODUCTS: ProductData[] = [
  {
    id: 1,
    nameAr: "منتج واي بروتين فيت خوليتي",
    nameEn: "Whey Protein Fit Quality",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "بروتين نقي لدعم العضلات والاستشفاء بعد التمرين.",
    descriptionEn: "Clean protein to support muscle growth and recovery after training.",
    detailDescriptionAr:
      "بروتين عالي الجودة صمم خصيصا لدعم نمو العضلات وتسريع الاستشفاء بعد التمرين. الخيار الامثل للرياضيين والمدربين الباحثين عن اداء اقوى ونتائج اسرع.",
    detailDescriptionEn:
      "Premium whey protein designed to support muscle growth and speed up post-workout recovery. Ideal for athletes and coaches seeking stronger performance and faster results.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    ratingDetailAr: "4.9 (1,890 مراجعة)",
    ratingDetailEn: "4.9 (1,890 reviews)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
    stockAr: "560 قطعة",
    stockEn: "560 pcs",
    soldProductsAr: "458 منتج",
    soldProductsEn: "458 products",
    likesLabel: "14.5 K",
    discountPercentage: 70,
    galleryImages: PRODUCT_GALLERY_A,
  },
  {
    id: 2,
    nameAr: "منتج واي بروتين جولد ستاندرد",
    nameEn: "Whey Protein Gold Standard",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "تركيبة بروتين متوازنة لدعم قوتك اليومية.",
    descriptionEn: "Balanced whey blend to support your daily strength goals.",
    detailDescriptionAr:
      "تركيبة متوازنة من البروتين والاحماض الامينية الاساسية لمساندة الاداء الرياضي اليومي. مناسب للتدريب المتكرر ولتحسين الاستشفاء العضلي.",
    detailDescriptionEn:
      "A balanced blend of protein and essential amino acids to support daily athletic performance and improve muscle recovery.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    ratingDetailAr: "4.8 (1,245 مراجعة)",
    ratingDetailEn: "4.8 (1,245 reviews)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
    stockAr: "410 قطعة",
    stockEn: "410 pcs",
    soldProductsAr: "390 منتج",
    soldProductsEn: "390 products",
    likesLabel: "11.2 K",
    galleryImages: PRODUCT_GALLERY_B,
  },
  {
    id: 3,
    nameAr: "منتج واي بروتين كريمي",
    nameEn: "Whey Protein Creamy",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "طعم كريمي غني مع امتصاص سريع.",
    descriptionEn: "Rich creamy flavor with fast absorption.",
    detailDescriptionAr:
      "منتج بروتين سريع الامتصاص بطعم كريمي مميز، يدعم استعادة القوة بعد التمرين ويمنحك جرعة عملية من البروتين اليومي.",
    detailDescriptionEn:
      "Fast-absorbing whey with a rich creamy flavor that supports post-workout recovery and delivers practical daily protein intake.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    ratingDetailAr: "4.9 (1,402 مراجعة)",
    ratingDetailEn: "4.9 (1,402 reviews)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
    stockAr: "520 قطعة",
    stockEn: "520 pcs",
    soldProductsAr: "458 منتج",
    soldProductsEn: "458 products",
    likesLabel: "9.8 K",
    discountPercentage: 35,
    galleryImages: PRODUCT_GALLERY_A,
  },
  {
    id: 4,
    nameAr: "منتج واي بروتين بلس",
    nameEn: "Whey Protein Plus",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "صيغة متقدمة للنشاط البدني المكثف.",
    descriptionEn: "Advanced formula for intensive physical activity.",
    detailDescriptionAr:
      "صيغة متقدمة للرياضيين ذوي الاحمال التدريبية العالية. تساعد على تعويض البروتين وتعزيز التعافي بين الحصص التدريبية.",
    detailDescriptionEn:
      "Advanced formula for athletes with high training loads. Helps replenish protein and improve recovery between sessions.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    ratingDetailAr: "4.7 (980 مراجعة)",
    ratingDetailEn: "4.7 (980 reviews)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
    stockAr: "300 قطعة",
    stockEn: "300 pcs",
    soldProductsAr: "260 منتج",
    soldProductsEn: "260 products",
    likesLabel: "6.3 K",
    galleryImages: PRODUCT_GALLERY_B,
  },
  {
    id: 5,
    nameAr: "منتج واي بروتين ماكس",
    nameEn: "Whey Protein Max",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "دعم يومي للطاقة وبناء الكتلة العضلية.",
    descriptionEn: "Daily support for energy and lean muscle building.",
    detailDescriptionAr:
      "مكمل بروتين عملي لروتينك اليومي، يوازن بين الجودة والقيمة مع مكونات مناسبة لدعم النمو العضلي والتحمل.",
    detailDescriptionEn:
      "Practical daily protein supplement balancing quality and value with ingredients that support muscle growth and endurance.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    ratingDetailAr: "4.8 (1,120 مراجعة)",
    ratingDetailEn: "4.8 (1,120 reviews)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
    stockAr: "480 قطعة",
    stockEn: "480 pcs",
    soldProductsAr: "430 منتج",
    soldProductsEn: "430 products",
    likesLabel: "8.4 K",
    discountPercentage: 20,
    galleryImages: PRODUCT_GALLERY_A,
  },
  {
    id: 6,
    nameAr: "منتج واي بروتين كلاسيك",
    nameEn: "Whey Protein Classic",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "الخيار الكلاسيكي لاحتياجك اليومي من البروتين.",
    descriptionEn: "Classic option for your daily protein needs.",
    detailDescriptionAr:
      "خيار كلاسيكي مستقر للمبتدئين والمتقدمين، يوفر دعما يوميا موثوقا للاهداف الرياضية مع طعم متوازن.",
    detailDescriptionEn:
      "A stable classic option for beginners and advanced athletes, providing reliable daily support for fitness goals.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    ratingDetailAr: "4.6 (840 مراجعة)",
    ratingDetailEn: "4.6 (840 reviews)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
    stockAr: "250 قطعة",
    stockEn: "250 pcs",
    soldProductsAr: "210 منتج",
    soldProductsEn: "210 products",
    likesLabel: "5.7 K",
    galleryImages: PRODUCT_GALLERY_B,
  },
]

export function getProductById(id: number) {
  return PRODUCTS.find((product) => product.id === id)
}

export function getDiscountLabel(discountPercentage: number, lang: string) {
  return lang === "ar" ? `خصم %${discountPercentage}` : `${discountPercentage}% OFF`
}

export function getOriginalPriceLabel(currentPrice: string, discountPercentage?: number) {
  if (typeof discountPercentage !== "number" || discountPercentage <= 0 || discountPercentage >= 100) {
    return null
  }

  const discountedAmount = Number.parseFloat(currentPrice)
  if (!Number.isFinite(discountedAmount)) {
    return null
  }

  const originalAmount = discountedAmount / (1 - discountPercentage / 100)
  return `${originalAmount.toFixed(2)} MAD`
}

export function extractNumericPrice(price: string) {
  const parsed = Number.parseFloat(price)
  return Number.isFinite(parsed) ? parsed : 0
}
