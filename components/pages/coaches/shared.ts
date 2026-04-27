export type CoachStatus = "online" | "offline"

export type CoachType = "fitness" | "running" | "football" | "basketball" | "yoga" | "strength"

export interface CoachCertification {
  titleAr: string
  titleEn: string
  issuerAr: string
  issuerEn: string
  year: string
  imageSrc: string
}

export interface CoachSocialLink {
  key: "facebook" | "instagram" | "x" | "linkedin" | "tiktok" | "snapchat"
  labelAr: string
  labelEn: string
  icon: string
  url: string
}

export interface CoachWorkDay {
  key: "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"
  labelAr: string
  labelEn: string
  timeAr: string
  timeEn: string
  isClosed?: boolean
}

export interface CoachData {
  id: number
  nameAr: string
  nameEn: string
  handle: string
  status: CoachStatus
  coachType: CoachType
  avatarSrc: string
  coverSrc: string
  descriptionAr: string
  descriptionEn: string
  bioAr: string
  bioEn: string
  locationAr: string
  locationEn: string
  specialtiesAr: string[]
  specialtiesEn: string[]
  followersCount: string
  followingCount: string
  postsCount: string
  workDays: CoachWorkDay[]
  counters: Array<{
    value: string
    labelAr: string
    labelEn: string
  }>
  certifications: CoachCertification[]
  socialLinks: CoachSocialLink[]
  mutualLeadAr: string
  mutualLeadEn: string
  mutualLabelAr: string
  mutualLabelEn: string
}

const DEFAULT_WORK_DAYS: CoachWorkDay[] = [
  { key: "sunday", labelAr: "الاحد", labelEn: "Sunday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
  { key: "monday", labelAr: "الاثنين", labelEn: "Monday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
  { key: "tuesday", labelAr: "الثلاثاء", labelEn: "Tuesday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
  { key: "wednesday", labelAr: "الاربعاء", labelEn: "Wednesday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
  { key: "thursday", labelAr: "الخميس", labelEn: "Thursday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
  { key: "friday", labelAr: "الجمعة: اجازة", labelEn: "Friday: Closed", timeAr: "", timeEn: "", isClosed: true },
  { key: "saturday", labelAr: "السبت", labelEn: "Saturday", timeAr: "1:00 ص - 6:30 م", timeEn: "1:00 AM - 6:30 PM" },
]

export const COACHES: CoachData[] = [
  {
    id: 1,
    nameAr: "حمزة بن الزوير",
    nameEn: "Hamza Ben Alzuwair",
    handle: "@hamzabenalzuwair",
    status: "online",
    coachType: "fitness",
    avatarSrc: "/images/default-user.jpg",
    coverSrc: "/images/default-user-1.png",
    descriptionAr: "مدرب لياقة بدنية يركز على بناء القوة، تحسين التحمل، ووضع خطط تدريب عملية تناسب كل مستوى.",
    descriptionEn: "A fitness coach focused on strength, endurance, and practical training plans for every level.",
    bioAr: "أؤمن بأن التدريب يجب أن يكون واضحا، مستمرا، ومبنيا على قياس التقدم الحقيقي. أشتغل مع المتدربين على برامج قابلة للتنفيذ داخل النادي أو في المنزل، مع متابعة أسبوعية وتعديلات ذكية حسب الأداء.",
    bioEn: "I believe training should be clear, consistent, and built around real progress. I work with athletes on practical plans for the gym or home, with weekly follow-up and smart adjustments based on performance.",
    locationAr: "فلسطين، غزة، حي الرمال الشمالي",
    locationEn: "Palestine, Gaza, Al-Rimal Al-Shamali",
    specialtiesAr: ["قوة وتحمل", "تضخيم عضلي", "إعادة تأهيل"],
    specialtiesEn: ["Strength and endurance", "Hypertrophy", "Rehabilitation"],
    followersCount: "12.7K",
    followingCount: "221",
    postsCount: "548",
    workDays: DEFAULT_WORK_DAYS,
    counters: [
      { value: "12+", labelAr: "سنوات الخبرة", labelEn: "Years of experience" },
      { value: "280", labelAr: "متدرب نشط", labelEn: "Active clients" },
      { value: "96%", labelAr: "نسبة رضا", labelEn: "Satisfaction" },
    ],
    certifications: [
      { titleAr: "شهادة تدريب شخصي متقدم", titleEn: "Advanced Personal Training Certificate", issuerAr: "أكاديمية القوة والحركة", issuerEn: "Strength & Motion Academy", year: "2023", imageSrc: "/images/default-user.jpg" },
      { titleAr: "اعتماد تغذية رياضية", titleEn: "Sports Nutrition Accreditation", issuerAr: "معهد الأداء الرياضي", issuerEn: "Sports Performance Institute", year: "2022", imageSrc: "/images/default-user-1.png" },
      { titleAr: "دورة تأهيل وإصابات", titleEn: "Rehab & Injury Course", issuerAr: "مركز الحركة المتقدمة", issuerEn: "Advanced Movement Center", year: "2021", imageSrc: "/images/man-running.png" },
    ],
    socialLinks: [
      { key: "facebook", labelAr: "فيسبوك", labelEn: "Facebook", icon: "ri:facebook-fill", url: "https://example.com" },
      { key: "instagram", labelAr: "انستغرام", labelEn: "Instagram", icon: "mdi:instagram", url: "https://example.com" },
      { key: "x", labelAr: "تويتر", labelEn: "Twitter", icon: "ri:twitter-x-line", url: "https://example.com" },
      { key: "linkedin", labelAr: "لينكدان", labelEn: "LinkedIn", icon: "ri:linkedin-fill", url: "https://example.com" },
      { key: "tiktok", labelAr: "تيكتوك", labelEn: "TikTok", icon: "ic:baseline-tiktok", url: "https://example.com" },
      { key: "snapchat", labelAr: "سناب شات", labelEn: "Snapchat", icon: "ri:snapchat-fill", url: "https://example.com" },
    ],
    mutualLeadAr: "شمس حسن و 15 آخرين",
    mutualLeadEn: "Shams Hassan and 15 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
  {
    id: 2,
    nameAr: "محمود أبو خليل",
    nameEn: "Mahmoud Abu Khalil",
    handle: "@mahmoudabukhali",
    status: "offline",
    coachType: "running",
    avatarSrc: "/images/default-user-1.png",
    coverSrc: "/images/default-user.jpg",
    descriptionAr: "مدرب جري ومسافات طويلة يساعدك على بناء الثبات والسرعة بطريقة تدريجية وآمنة.",
    descriptionEn: "Running and endurance coach helping you build pace, consistency, and safe progression.",
    bioAr: "أصمم خطط الجري بحسب الهدف: 5K، 10K، نصف ماراثون أو تحسين اللياقة العامة. أركز على التكنيك، التنفس، والاستمرارية، مع دروس قصيرة قابلة للتنفيذ يوميا.",
    bioEn: "I build running plans around your target: 5K, 10K, half marathon, or general fitness. I focus on technique, breathing, and consistency with short, actionable daily sessions.",
    locationAr: "فلسطين، غزة، شارع الوحدة",
    locationEn: "Palestine, Gaza, Al-Wehda Street",
    specialtiesAr: ["تحمل", "جري طويل", "برامج سباقات"],
    specialtiesEn: ["Endurance", "Long-distance running", "Race plans"],
    followersCount: "4.8K",
    followingCount: "102",
    postsCount: "213",
    workDays: DEFAULT_WORK_DAYS,
    counters: [
      { value: "9+", labelAr: "سنوات الخبرة", labelEn: "Years of experience" },
      { value: "140", labelAr: "عداؤون نشطون", labelEn: "Active runners" },
      { value: "4.9", labelAr: "تقييم المتدربين", labelEn: "Coach rating" },
    ],
    certifications: [
      { titleAr: "شهادة تدريب جري متقدم", titleEn: "Advanced Running Coaching", issuerAr: "اتحاد اللياقة الفلسطيني", issuerEn: "Palestinian Fitness Union", year: "2024", imageSrc: "/images/default-user-1.png" },
      { titleAr: "اعتماد تحليل الأداء الرياضي", titleEn: "Sports Performance Analysis", issuerAr: "أكاديمية الأداء", issuerEn: "Performance Academy", year: "2022", imageSrc: "/images/default-user.jpg" },
    ],
    socialLinks: [
      { key: "instagram", labelAr: "انستغرام", labelEn: "Instagram", icon: "mdi:instagram", url: "https://example.com" },
      { key: "x", labelAr: "تويتر", labelEn: "Twitter", icon: "ri:twitter-x-line", url: "https://example.com" },
      { key: "linkedin", labelAr: "لينكدان", labelEn: "LinkedIn", icon: "ri:linkedin-fill", url: "https://example.com" },
    ],
    mutualLeadAr: "يوسف علي و 9 آخرين",
    mutualLeadEn: "Youssef Ali and 9 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
  {
    id: 3,
    nameAr: "يزن الجعبري",
    nameEn: "Yazan Al-Jaabari",
    handle: "@yazanjaabari",
    status: "online",
    coachType: "football",
    avatarSrc: "/images/man-running.png",
    coverSrc: "/images/default-user-1.png",
    descriptionAr: "مدرب كرة قدم يطور المهارة، السرعة، والوعي التكتيكي للاعبين الناشئين والمحترفين.",
    descriptionEn: "Football coach focused on technique, speed, and tactical awareness for youth and pros.",
    bioAr: "أعمل على الجوانب الفنية والتكتيكية والبدنية في كرة القدم، مع اهتمام خاص بتطوير لاعب متوازن قادر على قراءة الملعب واتخاذ القرار بسرعة تحت الضغط.",
    bioEn: "I work on technical, tactical, and physical aspects of football, with special attention to building balanced players who can read the game and decide fast under pressure.",
    locationAr: "فلسطين، غزة، النصيرات",
    locationEn: "Palestine, Gaza, Nuseirat",
    specialtiesAr: ["مهارات فردية", "تدريب تكتيكي", "السرعة"],
    specialtiesEn: ["Individual skills", "Tactical training", "Speed"],
    followersCount: "8.1K",
    followingCount: "187",
    postsCount: "367",
    workDays: DEFAULT_WORK_DAYS,
    counters: [
      { value: "11+", labelAr: "سنوات الخبرة", labelEn: "Years of experience" },
      { value: "190", labelAr: "لاعبا", labelEn: "Players" },
      { value: "32", labelAr: "فريقا", labelEn: "Teams" },
    ],
    certifications: [
      { titleAr: "شهادة تدريب كرة قدم", titleEn: "Football Coaching License", issuerAr: "الاتحاد الرياضي", issuerEn: "Sports Federation", year: "2023", imageSrc: "/images/man-running.png" },
    ],
    socialLinks: [
      { key: "facebook", labelAr: "فيسبوك", labelEn: "Facebook", icon: "ri:facebook-fill", url: "https://example.com" },
      { key: "instagram", labelAr: "انستغرام", labelEn: "Instagram", icon: "mdi:instagram", url: "https://example.com" },
    ],
    mutualLeadAr: "أحمد جاد و 11 آخرين",
    mutualLeadEn: "Ahmed Jad and 11 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
  {
    id: 4,
    nameAr: "عمر رامي",
    nameEn: "Omar Rami",
    handle: "@omarrami",
    status: "offline",
    coachType: "basketball",
    avatarSrc: "/images/default-user.jpg",
    coverSrc: "/images/man-running.png",
    descriptionAr: "مدرب كرة سلة يركز على الانفجار، المهارة، وقراءة الملعب داخل وخارج الخطوط.",
    descriptionEn: "Basketball coach focused on explosiveness, skill, and game reading on and off the court.",
    bioAr: "أعتمد على التكرار الذكي والتمارين القصيرة عالية الجودة لبناء لاعب يتحرك بثقة، يمرر بذكاء، وينهي الهجمة في اللحظة المناسبة.",
    bioEn: "I rely on smart repetition and short high-quality drills to build a player who moves confidently, passes smartly, and finishes at the right moment.",
    locationAr: "فلسطين، غزة، حي النصر",
    locationEn: "Palestine, Gaza, Al-Nasr neighborhood",
    specialtiesAr: ["مهارات كرة السلة", "قوة انفجارية", "دفاع"],
    specialtiesEn: ["Basketball skills", "Explosive power", "Defense"],
    followersCount: "6.2K",
    followingCount: "94",
    postsCount: "188",
    workDays: DEFAULT_WORK_DAYS,
    counters: [
      { value: "7+", labelAr: "سنوات الخبرة", labelEn: "Years of experience" },
      { value: "85", labelAr: "لاعبا", labelEn: "Players" },
      { value: "18", labelAr: "منافسة", labelEn: "Competitions" },
    ],
    certifications: [
      { titleAr: "اعتماد تدريب كرة سلة", titleEn: "Basketball Coaching Certificate", issuerAr: "مجمع الأداء الرياضي", issuerEn: "Sport Performance Complex", year: "2021", imageSrc: "/images/default-user.jpg" },
    ],
    socialLinks: [
      { key: "instagram", labelAr: "انستغرام", labelEn: "Instagram", icon: "mdi:instagram", url: "https://example.com" },
      { key: "tiktok", labelAr: "تيكتوك", labelEn: "TikTok", icon: "ic:baseline-tiktok", url: "https://example.com" },
    ],
    mutualLeadAr: "سلمى ناصر و 7 آخرين",
    mutualLeadEn: "Salma Nasser and 7 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
  {
    id: 5,
    nameAr: "سارة عبد الله",
    nameEn: "Sara Abdullah",
    handle: "@saraabdullah",
    status: "online",
    coachType: "yoga",
    avatarSrc: "/images/default-user-1.png",
    coverSrc: "/images/default-user.jpg",
    descriptionAr: "مدربة يوغا تركز على المرونة، التنفس، والتوازن الذهني والجسدي.",
    descriptionEn: "Yoga coach focused on flexibility, breathing, and mental-physical balance.",
    bioAr: "أبني الجلسات حول التنفس، الحركة الواعية، وتخفيف التوتر، مع تعديلات لطيفة تناسب المبتدئين والمتقدمين على حد سواء.",
    bioEn: "I shape sessions around breathing, mindful movement, and stress relief, with gentle adjustments for both beginners and advanced students.",
    locationAr: "فلسطين، غزة، الشاطئ",
    locationEn: "Palestine, Gaza, Al-Shati camp",
    specialtiesAr: ["مرونة", "تأمل", "تعافي"],
    specialtiesEn: ["Flexibility", "Meditation", "Recovery"],
    followersCount: "9.3K",
    followingCount: "133",
    postsCount: "294",
    workDays: DEFAULT_WORK_DAYS,
    counters: [
      { value: "8+", labelAr: "سنوات الخبرة", labelEn: "Years of experience" },
      { value: "130", labelAr: "ممارسة أسبوعية", labelEn: "Weekly sessions" },
      { value: "4.8", labelAr: "تقييم المتدربين", labelEn: "Coach rating" },
    ],
    certifications: [
      { titleAr: "معلمة يوغا معتمدة", titleEn: "Certified Yoga Instructor", issuerAr: "أكاديمية الوعي والحركة", issuerEn: "Mind & Motion Academy", year: "2024", imageSrc: "/images/default-user-1.png" },
    ],
    socialLinks: [
      { key: "instagram", labelAr: "انستغرام", labelEn: "Instagram", icon: "mdi:instagram", url: "https://example.com" },
      { key: "facebook", labelAr: "فيسبوك", labelEn: "Facebook", icon: "ri:facebook-fill", url: "https://example.com" },
    ],
    mutualLeadAr: "نور حمد و 6 آخرين",
    mutualLeadEn: "Noor Hamad and 6 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
  {
    id: 6,
    nameAr: "فارس سمير",
    nameEn: "Faris Samir",
    handle: "@farissamir",
    status: "online",
    coachType: "strength",
    avatarSrc: "/images/default-user.jpg",
    coverSrc: "/images/default-user-1.png",
    descriptionAr: "مدرب قوة وبناء أجسام يوازن بين الشكل الصحيح، الأمان، والتدرج المدروس.",
    descriptionEn: "Strength and physique coach balancing form, safety, and structured progression.",
    bioAr: "أركز على التقنية قبل الحمل، وعلى جعل المتدرب يفهم الحركة قبل زيادة الأوزان. بهذه الطريقة نحصل على قوة حقيقية ونتائج مستقرة بدون مخاطرة غير ضرورية.",
    bioEn: "I focus on technique before load and on helping athletes understand movement before increasing weights. That creates real strength and stable results without unnecessary risk.",
    locationAr: "فلسطين، غزة، تل الهوى",
    locationEn: "Palestine, Gaza, Tel Al-Hawa",
    specialtiesAr: ["قوة", "بناء عضلي", "شكل الحركة"],
    specialtiesEn: ["Strength", "Muscle building", "Movement mechanics"],
    followersCount: "10.2K",
    followingCount: "201",
    postsCount: "421",
    workDays: DEFAULT_WORK_DAYS,
    counters: [
      { value: "10+", labelAr: "سنوات الخبرة", labelEn: "Years of experience" },
      { value: "210", labelAr: "متدربا", labelEn: "Clients" },
      { value: "5", labelAr: "خطط تدريب", labelEn: "Programs" },
    ],
    certifications: [
      { titleAr: "شهادة تدريب قوة متقدم", titleEn: "Advanced Strength Coaching", issuerAr: "معهد الأداء البدني", issuerEn: "Physical Performance Institute", year: "2023", imageSrc: "/images/default-user.jpg" },
    ],
    socialLinks: [
      { key: "facebook", labelAr: "فيسبوك", labelEn: "Facebook", icon: "ri:facebook-fill", url: "https://example.com" },
      { key: "linkedin", labelAr: "لينكدان", labelEn: "LinkedIn", icon: "ri:linkedin-fill", url: "https://example.com" },
    ],
    mutualLeadAr: "كريم مصطفى و 13 آخرين",
    mutualLeadEn: "Karim Mustafa and 13 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
  },
]

export function getCoachById(id: number): CoachData | undefined {
  return COACHES.find((coach) => coach.id === id)
}