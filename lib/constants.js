// lib/constants.js
// ── All static data for the clinic ─────────────────────────────

export const DOCTOR = {
  name:       'Dr. Urooj Shibli',
  credentials: 'MD, ABFM',
  specialty:  'Family Medicine & Obesity Specialist',
  practice:   'Shibli Family Medicine & Obesity Clinic',
  location:   'Mesquite, TX (Dallas Area)',
  address:    '802 US Highway 80 E, Mesquite, TX 75149',
  phone:      '(469) 827-7300',
  email:      'info@shiblimed.com',
  hours:      'Monday - Friday: 9:00 AM - 5:00 PM',
  closedDays: 'Saturday & Sunday: Closed',
  experience: '15+',
  image:
    'https://dims.healthgrades.com/dims3/MMH/0b1ebc4/2147483647/strip/true/crop/4749x7116+0+0/resize/4749x7116!/quality/75/?url=https%3A%2F%2Fucmscdn.healthgrades.com%2Fec%2F66%2F588039cf4a0690eab411337cd316%2Fy4q6x-urooj-shibli.jpg',
  bio: 'Dr. Urooj Shibli, MD is a board certified family medicine and obesity medicine specialist located in Texas. She has over 15 years of experience and has established a solid reputation for her pleasant disposition, ability to build a warm rapport with her patients, being a good listener and for providing clear, easy to follow diagnosis and treatment plans.',
  education:  'Ziauddin Medical University, 2004 (Gold Medal)',
  residency:  'Family Medicine Residency — Forbes / Allegheny Health Network, 2009',
  boardCert:  'American Board of Family Medicine (ABFM) & American Board of Obesity Medicine',
  awards: [
    'Gold Medal — Top Graduate',
    'Best Geriatric Resident Award',
    'Committed to Patient Care (3×)',
    'On-Time Doctor Award (2018)',
  ],
  languages:  ['English', 'Urdu', 'Punjabi', 'Basic Spanish', 'Basic Hindi'],
  specialties: [
    'Family & Primary Care',
    'Obesity & Weight Loss',
    'Pediatrics & Adolescent Care',
    'Geriatric Care',
    "Women's Health",
    'Chronic Disease Management',
    'Telemedicine / Virtual',
    'Cardiac Testing',
    'Preventive Screenings',
    'Wellness Counseling',
  ],
};

export const SERVICES = [
  {
    name:        'General Consultation',
    duration:    '30 min',
    price:       '$100',
    description: 'Comprehensive health assessment with a personalized treatment plan tailored to your unique needs.',
    icon:        'stethoscope',
    color:       'blue',
  },
  {
    name:        'Follow-up Visit',
    duration:    '15 min',
    price:       '$50',
    description: 'Review your progress and fine-tune your treatment plan for optimal health outcomes.',
    icon:        'filetext',
    color:       'violet',
  },
  {
    name:        'Telehealth Call',
    duration:    '20 min',
    price:       '$80',
    description: 'Professional medical consultation from the comfort and privacy of your own home.',
    icon:        'video',
    color:       'emerald',
  },
  {
    name:        'Vaccination',
    duration:    '10 min',
    price:       '$30',
    description: 'Stay protected with preventive immunizations administered by our experienced team.',
    icon:        'shield',
    color:       'rose',
  },
];

export const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM',  '1:30 PM',  '2:00 PM',  '2:30 PM',
  '3:00 PM',  '3:30 PM',  '4:00 PM',  '4:30 PM',
];

export const APPOINTMENT_TYPES = [
  'General Consultation',
  'Follow-up Visit',
  'Telehealth Call',
  'Vaccination / Flu Shot',
];

// Color palette for service cards (used in ServicesSection + AboutSection timeline)
export const SERVICE_COLORS = {
  blue: {
    bg:    'bg-blue-50 dark:bg-blue-950/30',
    icon:  'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    hover: 'group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50',
  },
  violet: {
    bg:    'bg-violet-50 dark:bg-violet-950/30',
    icon:  'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
    hover: 'group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50',
  },
  emerald: {
    bg:    'bg-emerald-50 dark:bg-emerald-950/30',
    icon:  'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    hover: 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50',
  },
  rose: {
    bg:    'bg-rose-50 dark:bg-rose-950/30',
    icon:  'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
    hover: 'group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50',
  },
};