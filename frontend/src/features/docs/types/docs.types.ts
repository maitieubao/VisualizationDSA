export interface NavItem {
  id: string;
  title: string;
  path?: string;
  children?: NavItem[];
}
