export interface iMenuItem {
  label: string;
  action?: () => void;
  href?: string;
  isButton?: boolean;
  icon?: string;
  active?: boolean;
  isPro?: boolean;
  hasDropdown?: boolean;
  open?: boolean;
  children?: any[];
}
