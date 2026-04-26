export type CoachStatus = "online" | "offline"

export type CoachType = "fitness" | "running" | "football" | "basketball" | "yoga" | "strength"

export interface CoachData {
  id: number
  nameAr: string
  nameEn: string
  status: CoachStatus
  coachType: CoachType
  descriptionAr: string
  descriptionEn: string
  mutualLeadAr: string
  mutualLeadEn: string
  mutualLabelAr: string
  mutualLabelEn: string
  avatarSrc: string
  roleBadgeAr: string
  roleBadgeEn: string
  followersCount: string
  followingCount: string
  postsCount: string
}

export const DEFAULT_COACH_AVATAR = "/images/default-user.jpg"

export const COACHES: CoachData[] = [
  {
    id: 1,
    nameAr: "حمزة بن الزوير",
    nameEn: "Hamza Ben Alzuwair",
    status: "online",
    coachType: "fitness",
    descriptionAr: "حالنا الرياضية هي المساحة المثالية لتحقيق أهدافك اللياقة، قوة، أو حياة صحية مستمرة.",
    descriptionEn: "Our fitness space is ideal to reach your goals for strength, health, and consistent progress.",
    mutualLeadAr: "شمس حسن و 15 آخرين",
    mutualLeadEn: "Shams Hassan and 15 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
    avatarSrc: "/images/default-user-1.png",
    roleBadgeAr: "مدرب اونلاين",
    roleBadgeEn: "Online Coach",
    followersCount: "12.7K",
    followingCount: "221",
    postsCount: "548",
  },
  {
    id: 2,
    nameAr: "إبراهيم عزام",
    nameEn: "Ibrahim Azzam",
    status: "offline",
    coachType: "running",
    descriptionAr: "مدرب جري بخطط يومية مرنة وتجهيزات متقدمة للمبتدئين والمحترفين.",
    descriptionEn: "Running coach with adaptive daily plans for beginners and pros.",
    mutualLeadAr: "شمس حسن و 8 آخرين",
    mutualLeadEn: "Shams Hassan and 8 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
    avatarSrc: "/images/default-user.jpg",
    roleBadgeAr: "مدرب اونلاين",
    roleBadgeEn: "Online Coach",
    followersCount: "4.8K",
    followingCount: "102",
    postsCount: "213",
  },
  {
    id: 3,
    nameAr: "كريم عادل",
    nameEn: "Karim Adel",
    status: "online",
    coachType: "football",
    descriptionAr: "مدرب كرة قدم بخبرة ميدانية طويلة وتدريبات تكتيكية متقدمة.",
    descriptionEn: "Football coach with advanced tactical sessions.",
    mutualLeadAr: "شمس حسن و 5 آخرين",
    mutualLeadEn: "Shams Hassan and 5 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
    avatarSrc: "/images/default-user-1.png",
    roleBadgeAr: "مدرب اونلاين",
    roleBadgeEn: "Online Coach",
    followersCount: "8.1K",
    followingCount: "187",
    postsCount: "367",
  },
  {
    id: 4,
    nameAr: "سعيد صقر",
    nameEn: "Saeed Saqr",
    status: "offline",
    coachType: "basketball",
    descriptionAr: "مدرب كرة سلة يركز على التسديد والتحمل وبناء الذكاء التكتيكي.",
    descriptionEn: "Basketball coach focused on shooting and tactical IQ.",
    mutualLeadAr: "شمس حسن و 4 آخرين",
    mutualLeadEn: "Shams Hassan and 4 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
    avatarSrc: "/images/default-user.jpg",
    roleBadgeAr: "مدرب اونلاين",
    roleBadgeEn: "Online Coach",
    followersCount: "6.2K",
    followingCount: "94",
    postsCount: "188",
  },
  {
    id: 5,
    nameAr: "لمياء طارق",
    nameEn: "Lamia Tarek",
    status: "online",
    coachType: "yoga",
    descriptionAr: "مدربة يوغا وتمارين تنفس لجلسات تركيز ومرونة وتحكم ذهني.",
    descriptionEn: "Yoga coach for mobility, breathing, and focus.",
    mutualLeadAr: "شمس حسن و 11 آخرين",
    mutualLeadEn: "Shams Hassan and 11 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
    avatarSrc: "/images/default-user-1.png",
    roleBadgeAr: "مدرب اونلاين",
    roleBadgeEn: "Online Coach",
    followersCount: "9.3K",
    followingCount: "133",
    postsCount: "294",
  },
  {
    id: 6,
    nameAr: "أحمد فواز",
    nameEn: "Ahmed Fawaz",
    status: "online",
    coachType: "strength",
    descriptionAr: "مدرب قوة ولياقة ببرامج مخصصة لبناء القوة والكتلة العضلية.",
    descriptionEn: "Strength coach with custom hypertrophy programs.",
    mutualLeadAr: "شمس حسن و 9 آخرين",
    mutualLeadEn: "Shams Hassan and 9 others",
    mutualLabelAr: "أصدقاء مشتركين",
    mutualLabelEn: "Mutual friends",
    avatarSrc: "/images/default-user.jpg",
    roleBadgeAr: "مدرب اونلاين",
    roleBadgeEn: "Online Coach",
    followersCount: "10.2K",
    followingCount: "201",
    postsCount: "421",
  },
]

export function getCoachById(id: number): CoachData | undefined {
  return COACHES.find((coach) => coach.id === id)
}
