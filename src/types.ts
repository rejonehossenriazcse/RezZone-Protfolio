export interface ThemePalette {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
}

export interface SiteTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  lightMode: ThemePalette;
  darkMode: ThemePalette;
  presetName?: string;
  fontFamily?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  openNewTab?: boolean;
}

export interface CTAButton {
  id: string;
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
  openNewTab?: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
}

export interface SocialPlatformCard {
  id: string;
  name: string;
  handle?: string;
  description?: string;
  url: string;
  pictureUrl: string;
  buttonLabel?: string;
  badge?: string;
  category?: string;
  order: number;
  enabled: boolean;
}

export interface AdminAuthSettings {
  adminEmail: string;
  adminPassword?: string;
  googleAuthEnabled: boolean;
  authorizedGoogleEmails: string[];
  googleClientId?: string;
  lastLoginAt?: string;
}

export interface SiteSettings {
  brandName: string;
  logoUrl?: string;
  logoHeight?: number;
  faviconUrl?: string;
  heroLayout: 'imageLeft' | 'imageRight' | 'imageCenter';
  profileImageShape: 'circle' | 'rounded' | 'square';
  enable3D: boolean;
  threeStyle: 'torus' | 'particles' | 'rings';
  skillsDisplayStyle: 'cards' | 'bars' | 'tags';
  navItems: NavItem[];
  theme: SiteTheme;
  socialsPageSettings?: {
    title: string;
    subtitle: string;
    layout: 'grid' | 'list';
  };
  sectionsVisibility: {
    hero: boolean;
    about: boolean;
    education: boolean;
    skills: boolean;
    languages: boolean;
    socials: boolean;
    contact: boolean;
  };
}

export interface ProfileData {
  fullName: string;
  tagline: string;
  bio: string;
  district: string;
  profilePicture: string;
  email: string;
  phone?: string;
  address?: string;
  currentRole?: string;
  ctaButtons: CTAButton[];
  socialLinks: SocialLink[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  level: string; // e.g., "BSc", "HSC", "SSC", "MSc", "Diploma"
  passingYear: number | string;
  details?: string;
  order: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  proficiency?: number; // 0 to 100
  order: number;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string; // e.g. "Native", "Fluent", "Conversational"
  order: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

export interface CMSData {
  siteSettings: SiteSettings;
  profile: ProfileData;
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  socialPlatforms?: SocialPlatformCard[];
  adminAuthSettings?: AdminAuthSettings;
  contactSubmissions?: ContactSubmission[];
  mediaLibrary?: MediaItem[];
  footer: {
    copyrightText: string;
    tagline?: string;
  };
}
