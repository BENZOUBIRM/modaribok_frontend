/**
 * Static mock data for the homepage feed, suggestions, events.
 * User names and event labels are locale-aware.
 * Post / comment body text is fixed-language (some EN, some AR) — not locale-switched.
 */

import type { MockUser } from "@/types/profile"
import type { MockPost, MockComment } from "@/types/publication"
import type { MockSuggestion } from "@/types/suggestions"
import type { MockEvent, MockInvitation, MockScheduleEvent, MockEventLegendItem } from "@/types/events"

// Re-export types so existing consumers can still import from here during migration
export type { MockUser, MockPost, MockComment, MockSuggestion, MockEvent, MockInvitation, MockScheduleEvent, MockEventLegendItem }

/* ── Helper (for names & labels only) ── */
function t(locale: string, en: string, ar: string) {
  return locale === "ar" ? ar : en
}

/* ── Users ── */
export function getMockUsers(locale: string): MockUser[] {
  return [
    { id: 1, name: t(locale, "Younes Zhari", "يونس الزهاري"), handle: "@youneszhari", avatarUrl: "/images/default-user.jpg" },
    { id: 2, name: t(locale, "Youssef Benali", "يوسف بنعلي"), handle: "@youssefbenali", avatarUrl: "/images/default-user.jpg" },
    { id: 3, name: t(locale, "Fatima Zahra Amrani", "فاطمة الزهراء العمراني"), handle: "@fatimazahra", avatarUrl: "/images/default-user.jpg" },
    { id: 4, name: t(locale, "Moncef Benzoubir", "منصف بن زوبير"), handle: "@moncefbenz", avatarUrl: "/images/default-user.jpg" },
    { id: 5, name: t(locale, "Hamza Sabaa", "حمزة سبأ"), handle: "@hamzasabaa", avatarUrl: "/images/default-user.jpg" },
  ]
}

/* ── Posts ── */
export function getMockPosts(locale: string): MockPost[] {
  const users = getMockUsers(locale)
  return [
    /* ─ Post 1 (EN) — Younes Zhari — long gym recap ─ */
    {
      id: 1,
      author: users[0],
      text: "Just finished a killer upper-body session 💪 4 sets of bench press, 3 sets of overhead press, and finished with weighted dips. Progressive overload is the name of the game — last week I could barely hit 80 kg on the bench, today I repped it for 6 clean reps. If you're still doing the same weight every week, you're leaving gains on the table. Track your lifts, eat enough protein, and trust the process. Consistency beats motivation every single day.",
      images: [],
      createdAt: "2h",
      likesCount: 34,
      commentsCount: 8,
      sharesCount: 5,
      comments: [
        {
          id: 101,
          author: users[1],
          text: "Bro 80 kg bench is solid! What program are you running? I've been stuck at 70 for weeks 😩",
          createdAt: "1h",
          likesCount: 6,
          parentCommentId: null,
          repliesCount: 1,
          replies: [
            {
              id: 102,
              author: users[0],
              text: "Thanks man! I'm doing a PPL split, 4 days a week. The trick for me was adding paused reps on lighter days — really helps with the sticking point off the chest.",
              createdAt: "45m",
              likesCount: 3,
              parentCommentId: 101,
              repliesCount: 0,
              replies: [],
            },
          ],
        },
        {
          id: 103,
          author: users[4],
          text: "Progressive overload is everything 🔥 people underestimate how important it is to just add 1-2 kg each week. Great post!",
          createdAt: "30m",
          likesCount: 9,
          parentCommentId: null,
          repliesCount: 0,
          replies: [],
        },
      ],
    },
    /* ─ Post 2 (AR) — Fatima Zahra — running diary ─ */
    {
      id: 2,
      author: users[2],
      text: "صباح الخير 🌅 اليوم كملت أول 10 كيلومترات ديالي بلا ما نوقف! كنت كنحلم بهاد اللحظة من 3 شهور ملي بديت كنجري. البداية كانت صعيبة بزاف — حتى كيلومتر واحد كان كيبان لي مستحيل. لكن يوم بعد يوم، أسبوع بعد أسبوع، الجسم تعود و الإرادة ولات قوية. اللي باغي يبدا يجري، نصيحتي ليه: ما تقارنش راسك مع حد، غير تنافس مع النسخة ديالك لبارح 🏃‍♀️",
      images: [],
      createdAt: "5h",
      likesCount: 52,
      commentsCount: 12,
      sharesCount: 18,
      comments: [
        {
          id: 201,
          author: users[3],
          text: "ماشاء الله يا فاطمة! 10 كيلومتاات إنجاز كبير 🎉 أنا مزال فـ 5 كيلو ولكن غادي نوصل إن شاء الله",
          createdAt: "4h",
          likesCount: 14,
          parentCommentId: null,
          repliesCount: 1,
          replies: [
            {
              id: 202,
              author: users[2],
              text: "إن شاء الله يا منصف! المهم ما توقفش، 5 كيلو رائعة والباقي غادي يجي بوحدو 💪",
              createdAt: "3h",
              likesCount: 8,
              parentCommentId: 201,
              repliesCount: 0,
              replies: [],
            },
          ],
        },
      ],
    },
    /* ─ Post 3 (EN) — Hamza Sabaa — football recap ─ */
    {
      id: 3,
      author: users[4],
      text: "Sunday league football hits different 🤣⚽ We won 4-2 today and I scored a brace! Nothing beats the feeling of playing with your mates on a sunny morning. If you're in Casablanca and want to join our weekly pickup games, drop a comment below 👇",
      images: [],
      createdAt: "8h",
      likesCount: 41,
      commentsCount: 15,
      sharesCount: 7,
      comments: [
        {
          id: 301,
          author: users[1],
          text: "Where do you guys play? I'm in Maârif and looking for a regular squad!",
          createdAt: "7h",
          likesCount: 5,
          parentCommentId: null,
          repliesCount: 1,
          replies: [
            {
              id: 302,
              author: users[4],
              text: "We play at the Terrain Bourgogne pitch every Sunday 9 AM. DM me your number and I'll add you to the group!",
              createdAt: "6h",
              likesCount: 3,
              parentCommentId: 301,
              repliesCount: 0,
              replies: [],
            },
          ],
        },
        {
          id: 303,
          author: users[0],
          text: "A brace? Let's go Hamza! 🔥 Next week I'm joining for sure",
          createdAt: "5h",
          likesCount: 7,
          parentCommentId: null,
          repliesCount: 0,
          replies: [],
        },
      ],
    },
    /* ─ Post 4 (AR) — Moncef Benzoubir — gym motivation ─ */
    {
      id: 4,
      author: users[3],
      text: "6 أشهر ديال الانضباط فـ السبور 🏋️ قبل كنت كنلعب أسبوع ونوقف شهر، دابا وليت كل يوم كنّوض على 6 ديال الصباح و كندوز ساعة و نص فـ الجيم قبل الخدمة. الفرق ماشي غير فـ الجسم — حتى فـ الصحة النفسية و الثقة بالنفس. ما كاين حتى سر، غير الاستمرارية.",
      images: [],
      createdAt: "12h",
      likesCount: 67,
      commentsCount: 20,
      sharesCount: 25,
      comments: [
        {
          id: 401,
          author: users[0],
          text: "هاد الكلام صحيح 💯 الاستمرارية هي المفتاح. واش كتبع شي برنامج معين؟",
          createdAt: "11h",
          likesCount: 11,
          parentCommentId: null,
          repliesCount: 1,
          replies: [
            {
              id: 402,
              author: users[3],
              text: "أيه أخي، كنبع برنامج Push/Pull/Legs مع كارديو خفيف 3 مرات فـ الأسبوع. المهم هو الانتظام 🗓️",
              createdAt: "10h",
              likesCount: 5,
              parentCommentId: 401,
              repliesCount: 0,
              replies: [],
            },
          ],
        },
        {
          id: 403,
          author: users[2],
          text: "الله يعطيك الصحة يا منصف! 6 أشهر ماشي ساهلة — respect كبير 👏",
          createdAt: "9h",
          likesCount: 15,
          parentCommentId: null,
          repliesCount: 0,
          replies: [],
        },
      ],
    },
  ]
}

/* ── Friend suggestions ── */
export function getMockSuggestions(locale: string): MockSuggestion[] {
  const users = getMockUsers(locale)
  return [
    { id: 1, name: users[1].name, handle: users[1].handle, avatarUrl: users[1].avatarUrl },
    { id: 2, name: users[2].name, handle: users[2].handle, avatarUrl: users[2].avatarUrl },
    { id: 3, name: users[3].name, handle: users[3].handle, avatarUrl: users[3].avatarUrl },
    { id: 4, name: users[4].name, handle: users[4].handle, avatarUrl: users[4].avatarUrl },
    { id: 5, name: users[1].name, handle: users[1].handle, avatarUrl: users[1].avatarUrl },
    { id: 6, name: users[2].name, handle: users[2].handle, avatarUrl: users[2].avatarUrl },
  ]
}

/* ── Current events ── */
export function getMockCurrentEvents(locale: string): MockEvent[] {
  return [
    {
      id: 1,
      title: t(locale, "Football Event", "فعالية كرة القدم"),
      time: t(locale, "Today 09 May, 9:30 AM - 8 AM", "اليوم 09 مايو، 8 AM - 9:30 AM"),
      color: "bg-blue-500",
      countdown: "4h : 45m : 50s",
    },
  ]
}

/* ── Event invitations ── */
export function getMockInvitations(locale: string): MockInvitation[] {
  return [
    {
      id: 1,
      title: t(locale, "Run With Friends", "فعالية الجري مع الأصدقاء"),
      date: t(locale, "Mon, 16 Jan", "الإثنين 16 يناير"),
      time: "1:30 PM - 12 PM",
      color: "bg-red-500",
    },
    {
      id: 2,
      title: t(locale, "Run With Friends", "فعالية الجري مع الأصدقاء"),
      date: t(locale, "Mon, 16 Jan", "الإثنين 16 يناير"),
      time: "1:30 PM - 12 PM",
      color: "bg-red-500",
    },
  ]
}

/* ── Schedule events ── */
export function getMockScheduleEvents(locale: string): MockScheduleEvent[] {
  return [
    {
      id: 1,
      title: t(locale, "Football Event", "فعالية كرة القدم"),
      startHour: 8,
      startMinute: 0,
      endHour: 8,
      endMinute: 30,
      color: "bg-blue-500/20 border-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: 2,
      title: t(locale, "Swimming Event", "فعالية السباحة"),
      startHour: 10,
      startMinute: 30,
      endHour: 11,
      endMinute: 0,
      color: "bg-cyan-500/20 border-cyan-500",
      textColor: "text-cyan-600 dark:text-cyan-400",
    },
    {
      id: 3,
      title: t(locale, "Run With Friends", "فعالية الجري مع الأصدقاء"),
      startHour: 12,
      startMinute: 0,
      endHour: 12,
      endMinute: 30,
      color: "bg-red-500/20 border-red-500",
      textColor: "text-red-600 dark:text-red-400",
    },
    {
      id: 4,
      title: t(locale, "Basketball Event", "فعالية كرة السلة"),
      startHour: 14,
      startMinute: 0,
      endHour: 15,
      endMinute: 0,
      color: "bg-green-500/20 border-green-500",
      textColor: "text-green-600 dark:text-green-400",
    },
  ]
}

/* ── Event legend ── */
export function getMockEventLegend(locale: string): MockEventLegendItem[] {
  return [
    { label: t(locale, "Football Event", "فعالية كرة القدم"), color: "bg-blue-500" },
    { label: t(locale, "Swimming Event", "فعالية السباحة"), color: "bg-cyan-500" },
    { label: t(locale, "Weightlifting", "فعالية رفع اثقال"), color: "bg-pink-500" },
    { label: t(locale, "Run With Friends", "فعالية الجري مع الأصدقاء"), color: "bg-red-500" },
    { label: t(locale, "Basketball Event", "فعالية كرة السلة"), color: "bg-green-500" },
  ]
}
