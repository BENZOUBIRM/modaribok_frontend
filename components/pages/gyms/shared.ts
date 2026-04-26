export type GymGenderTag = "women" | "men"

export interface GymWorkDay {
  key: "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"
  labelAr: string
  labelEn: string
  timeAr: string
  timeEn: string
  isClosed?: boolean
}

export interface GymPriceItem {
  key: "hour" | "month" | "year"
  labelAr: string
  labelEn: string
  value: number
}

export interface GymSocialLink {
  key: "facebook" | "instagram" | "x" | "linkedin" | "tiktok" | "snapchat"
  labelAr: string
  labelEn: string
  icon: string
  url: string
}

export interface GymData {
  id: number
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  aboutAr: string
  aboutEn: string
  locationAr: string
  locationEn: string
  imageSrc: string
  logoSrc: string
  email: string
  phone: string
  website: string
  capacity: number
  genderTags: GymGenderTag[]
  sportsAr: string[]
  sportsEn: string[]
  facilitiesAr: string[]
  facilitiesEn: string[]
  galleryImages: string[]
  workDays: GymWorkDay[]
  prices: GymPriceItem[]
  socialLinks: GymSocialLink[]
}

export const GYMS: GymData[] = [
  {
    id: 1,
    titleAr: "تكنو جيم غزة",
    titleEn: "Techno Gym Gaza",
    descriptionAr: "صالاتنا الرياضية هي المساحة المثالية لتحقيق أهدافك الصحية واللياقية. مجهزة بأحدث الأجهزة والمعدات مع أجواء تدريبية متكاملة، وخدمة مستمرة لتطوير أدائك الرياضي خطوة بخطوة.",
    descriptionEn: "Our gyms are designed to help you reach your health and fitness goals with modern equipment, balanced training atmosphere, and continuous support.",
    aboutAr: "نقدم أيضا حصص جماعية متنوعة مثل اليوغا لزيادة مرونتك وراحة ذهنك، الزومبا لإضافة المرح إلى حركتك، والكروس فيت لمن يبحث عن تحديات عالية المستوى. فريق المدربين المحترفين لدينا موجود دائما لتوجيهك، دعمك، والإجابة عن أسئلتك بخبرة وابتسامة. مهمتنا أن نجعل التدريب تجربة ممتعة وملهمة تساعدك على تحقيق أفضل نسخة من نفسك، يوما بعد يوم.",
    aboutEn: "We also run group classes like yoga for flexibility and focus, zumba for energetic fun, and crossfit for high-level challenges. Our coaching team is always available to guide and support you. Our mission is to make training enjoyable and inspiring so you can reach your best self day after day.",
    locationAr: "فلسطين، غزة، حي الرمال الشمالي، شارع عبد الرحيم محمود، بالقرب من مدرسة الماجدة وسيلة",
    locationEn: "Palestine, Gaza, Al-Rimal Al-Shamali, Abdel Rahim Mahmoud St., near Al-Majida Waseela School",
    imageSrc: "/images/default-user.jpg",
    logoSrc: "/images/default-user-1.png",
    email: "sameerrshams95@gmail.com",
    phone: "+972 59 858 4191",
    website: "https://www.behance.net/shamshassan",
    capacity: 200,
    genderTags: ["men", "women"],
    sportsAr: ["كرة السلة", "كرة القدم", "الجري مع الأصدقاء"],
    sportsEn: ["Basketball", "Football", "Run with friends"],
    facilitiesAr: ["كافي كورنر", "حديقة استرخاء", "بركة سباحة ترفيهية"],
    facilitiesEn: ["Coffee corner", "Relaxing garden", "Recreational pool"],
    galleryImages: [
      "/images/default-user.jpg",
      "/images/default-user-1.png",
      "/images/man-running.png",
      "/images/default-user-1.png",
      "/images/default-user.jpg"
    ],
    workDays: [
      { key: "sunday", labelAr: "الاحد", labelEn: "Sunday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "monday", labelAr: "الاثنين", labelEn: "Monday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "tuesday", labelAr: "الثلاثاء", labelEn: "Tuesday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "wednesday", labelAr: "الاربعاء", labelEn: "Wednesday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "thursday", labelAr: "الخميس", labelEn: "Thursday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "friday", labelAr: "الجمعة: اجازة", labelEn: "Friday: Closed", timeAr: "", timeEn: "", isClosed: true },
      { key: "saturday", labelAr: "السبت", labelEn: "Saturday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" }
    ],
    prices: [
      { key: "hour", labelAr: "الساعة", labelEn: "Hour", value: 40 },
      { key: "month", labelAr: "الشهر", labelEn: "Month", value: 400 },
      { key: "year", labelAr: "السنة", labelEn: "Year", value: 4000 }
    ],
    socialLinks: [
      { key: "facebook", labelAr: "فيسبوك", labelEn: "Facebook", icon: "ri:facebook-fill", url: "https://www.behance.net/shamshassan" },
      { key: "instagram", labelAr: "انستغرام", labelEn: "Instagram", icon: "mdi:instagram", url: "https://www.behance.net/shamshassan" },
      { key: "x", labelAr: "تويتر", labelEn: "Twitter", icon: "ri:twitter-x-line", url: "https://www.behance.net/shamshassan" },
      { key: "linkedin", labelAr: "لينكدان", labelEn: "Linkedin", icon: "ri:linkedin-fill", url: "https://www.behance.net/shamshassan" },
      { key: "tiktok", labelAr: "تيكتوك", labelEn: "Tiktok", icon: "ic:baseline-tiktok", url: "https://www.behance.net/shamshassan" },
      { key: "snapchat", labelAr: "سناب شات", labelEn: "Snapchat", icon: "ri:snapchat-fill", url: "https://www.behance.net/shamshassan" }
    ]
  },
  {
    id: 2,
    titleAr: "فريندس جيم",
    titleEn: "Friends Gym",
    descriptionAr: "صالاتنا الرياضية تقدم تجربة تدريب مرنة ومتكاملة مع مدربين مختصين، وبرامج يومية مناسبة لكل المستويات في بيئة محفزة.",
    descriptionEn: "A flexible gym experience with specialist coaches and daily programs suitable for all levels in a motivating environment.",
    aboutAr: "فريندس جيم بيئة اجتماعية قوية تجمع بين التدريب الممتع والالتزام. انضم اليوم وابدأ رحلتك.",
    aboutEn: "Friends Gym offers a social and motivating environment that blends fun with disciplined training.",
    locationAr: "فلسطين، غزة، حي الرمال الشمالي، شارع عبد الرحيم محمود، بالقرب من مدرسة الماجدة وسيلة",
    locationEn: "Palestine, Gaza, Al-Rimal Al-Shamali, Abdel Rahim Mahmoud St., near Al-Majida Waseela School",
    imageSrc: "/images/default-user-1.png",
    logoSrc: "/images/default-user.jpg",
    email: "friendsgym@example.com",
    phone: "+972 59 000 0002",
    website: "https://example.com/friends-gym",
    capacity: 160,
    genderTags: ["men"],
    sportsAr: ["الجري مع الأصدقاء", "كرة السلة"],
    sportsEn: ["Run with friends", "Basketball"],
    facilitiesAr: ["كافي كورنر", "حديقة استرخاء"],
    facilitiesEn: ["Coffee corner", "Relaxing garden"],
    galleryImages: ["/images/default-user-1.png", "/images/man-running.png", "/images/default-user.jpg", "/images/default-user-1.png", "/images/man-running.png"],
    workDays: [
      { key: "sunday", labelAr: "الاحد", labelEn: "Sunday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "monday", labelAr: "الاثنين", labelEn: "Monday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "tuesday", labelAr: "الثلاثاء", labelEn: "Tuesday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "wednesday", labelAr: "الاربعاء", labelEn: "Wednesday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "thursday", labelAr: "الخميس", labelEn: "Thursday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "friday", labelAr: "الجمعة: اجازة", labelEn: "Friday: Closed", timeAr: "", timeEn: "", isClosed: true },
      { key: "saturday", labelAr: "السبت", labelEn: "Saturday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" }
    ],
    prices: [
      { key: "hour", labelAr: "الساعة", labelEn: "Hour", value: 30 },
      { key: "month", labelAr: "الشهر", labelEn: "Month", value: 320 },
      { key: "year", labelAr: "السنة", labelEn: "Year", value: 3200 }
    ],
    socialLinks: [
      { key: "facebook", labelAr: "فيسبوك", labelEn: "Facebook", icon: "ri:facebook-fill", url: "https://example.com" },
      { key: "instagram", labelAr: "انستغرام", labelEn: "Instagram", icon: "mdi:instagram", url: "https://example.com" },
      { key: "x", labelAr: "تويتر", labelEn: "Twitter", icon: "ri:twitter-x-line", url: "https://example.com" },
      { key: "linkedin", labelAr: "لينكدان", labelEn: "Linkedin", icon: "ri:linkedin-fill", url: "https://example.com" },
      { key: "tiktok", labelAr: "تيكتوك", labelEn: "Tiktok", icon: "ic:baseline-tiktok", url: "https://example.com" },
      { key: "snapchat", labelAr: "سناب شات", labelEn: "Snapchat", icon: "ri:snapchat-fill", url: "https://example.com" }
    ]
  },
  {
    id: 3,
    titleAr: "اوكسجين جيم",
    titleEn: "Oxygen Gym",
    descriptionAr: "نوفر لك بيئة تدريب حديثة، ومرافق منظمة، وخطط تطوير أسبوعية تساعدك على الاستمرار وتحقيق نتائج فعلية.",
    descriptionEn: "Modern training setup, organized facilities, and weekly progress plans that keep you consistent and moving forward.",
    aboutAr: "اوكسجين جيم مساحة مصممة بعناية لكل من يريد رفع مستوى اللياقة والصحة ضمن أجواء عملية ومشجعة.",
    aboutEn: "Oxygen Gym is designed for members who want practical and motivating training with modern facilities.",
    locationAr: "فلسطين، غزة، حي الرمال الشمالي، شارع عبد الرحيم محمود، بالقرب من مدرسة الماجدة وسيلة",
    locationEn: "Palestine, Gaza, Al-Rimal Al-Shamali, Abdel Rahim Mahmoud St., near Al-Majida Waseela School",
    imageSrc: "/images/man-running.png",
    logoSrc: "/images/default-user.jpg",
    email: "oxygen@example.com",
    phone: "+972 59 000 0003",
    website: "https://example.com/oxygen",
    capacity: 220,
    genderTags: ["men", "women"],
    sportsAr: ["كرة السلة", "كرة القدم"],
    sportsEn: ["Basketball", "Football"],
    facilitiesAr: ["بركة سباحة ترفيهية", "حديقة استرخاء"],
    facilitiesEn: ["Recreational pool", "Relaxing garden"],
    galleryImages: ["/images/man-running.png", "/images/default-user.jpg", "/images/default-user-1.png", "/images/man-running.png", "/images/default-user.jpg"],
    workDays: [
      { key: "sunday", labelAr: "الاحد", labelEn: "Sunday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "monday", labelAr: "الاثنين", labelEn: "Monday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "tuesday", labelAr: "الثلاثاء", labelEn: "Tuesday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "wednesday", labelAr: "الاربعاء", labelEn: "Wednesday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "thursday", labelAr: "الخميس", labelEn: "Thursday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
      { key: "friday", labelAr: "الجمعة: اجازة", labelEn: "Friday: Closed", timeAr: "", timeEn: "", isClosed: true },
      { key: "saturday", labelAr: "السبت", labelEn: "Saturday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" }
    ],
    prices: [
      { key: "hour", labelAr: "الساعة", labelEn: "Hour", value: 45 },
      { key: "month", labelAr: "الشهر", labelEn: "Month", value: 430 },
      { key: "year", labelAr: "السنة", labelEn: "Year", value: 4100 }
    ],
    socialLinks: [
      { key: "facebook", labelAr: "فيسبوك", labelEn: "Facebook", icon: "ri:facebook-fill", url: "https://example.com" },
      { key: "instagram", labelAr: "انستغرام", labelEn: "Instagram", icon: "mdi:instagram", url: "https://example.com" },
      { key: "x", labelAr: "تويتر", labelEn: "Twitter", icon: "ri:twitter-x-line", url: "https://example.com" },
      { key: "linkedin", labelAr: "لينكدان", labelEn: "Linkedin", icon: "ri:linkedin-fill", url: "https://example.com" },
      { key: "tiktok", labelAr: "تيكتوك", labelEn: "Tiktok", icon: "ic:baseline-tiktok", url: "https://example.com" },
      { key: "snapchat", labelAr: "سناب شات", labelEn: "Snapchat", icon: "ri:snapchat-fill", url: "https://example.com" }
    ]
  }
]

export function getGymById(id: number): GymData | undefined {
  return GYMS.find((gym) => gym.id === id)
}
