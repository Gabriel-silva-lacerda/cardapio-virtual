export interface iMenuItem {
  label: string;
  action?: () => void;
  href?: string;
  isButton?: boolean;
}
