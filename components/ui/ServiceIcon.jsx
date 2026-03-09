// components/ui/ServiceIcon.jsx
import { Stethoscope, FileText, Video, Shield } from 'lucide-react';

const ICON_MAP = {
  stethoscope: Stethoscope,
  filetext:    FileText,
  video:       Video,
  shield:      Shield,
};

/**
 * ServiceIcon — maps a string type to a Lucide icon.
 * Falls back to Stethoscope if the type is unknown.
 */
export function ServiceIcon({ type, className }) {
  const Icon = ICON_MAP[type] || Stethoscope;
  return <Icon className={className} />;
}

export default ServiceIcon;