import {
  Globe,
  FileText,
  BriefcaseBusiness,
  ClipboardList,
  Mic,
  Mail,
  User,
  LogOut,
  Star,
  MessageSquare,
  Send,
  Share2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const TOOL_ICONS: Record<string, LucideIcon> = {
  "website-prompt-generator":         Globe,
  "cover-letter-generator":           FileText,
  "linkedin-summary-generator":       BriefcaseBusiness,
  "resume-bullet-point-generator":    ClipboardList,
  "elevator-pitch-generator":         Mic,
  "thank-you-email-generator":        Mail,
  "personal-bio-generator":           User,
  "resignation-letter-generator":     LogOut,
  "linkedin-recommendation-generator": Star,
  "email-subject-line-generator":     MessageSquare,
  "cold-outreach-email-generator":    Send,
  "social-bio-generator":             Share2,
};

export const FALLBACK_ICON: LucideIcon = Sparkles;

export function getToolIcon(slug: string): LucideIcon {
  return TOOL_ICONS[slug] ?? FALLBACK_ICON;
}
