import { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface NavItem {
  /** Route to navigate to. */
  href: string;
  /** Short label shown under the tab icon. */
  label: string;
  icon: IconName;
}

export interface RoleNav {
  /** Friendly title shown in the app header. */
  portalName: string;
  /** Bottom tab bar entries — keep to 5 max so labels stay readable. */
  tabs: NavItem[];
  /** Extra destinations surfaced in the "More" sheet. */
  more: NavItem[];
}

/** Roles that share the (admin) route group. */
export const ADMIN_ROLES = [
  'SuperAdmin',
  'Principal',
  'Accountant',
  'Reception',
  'Librarian',
  'TransportManager',
] as const;

/**
 * Per-role navigation map.
 *
 * Only routes that actually exist in src/app are listed here — every href below
 * was verified against the filesystem, so there are no dead tabs.
 */
export const ROLE_NAV: Record<string, RoleNav> = {
  SuperAdmin: {
    portalName: 'Super Admin',
    tabs: [
      { href: '/(admin)/cross-school', label: 'Home',    icon: 'stats-chart-outline' },
      { href: '/(admin)/schools',      label: 'Schools', icon: 'business-outline' },
      { href: '/notifications',        label: 'Alerts',  icon: 'notifications-outline' },
      { href: '/profile',              label: 'Profile', icon: 'person-outline' },
    ],
    more: [
      { href: '/(admin)/settings',     label: 'Global Settings', icon: 'settings-outline' },
      { href: '/(admin)/reports',      label: 'Reports',         icon: 'document-text-outline' },
    ],
  },

  Principal: {
    portalName: 'Principal',
    tabs: [
      { href: '/(admin)',              label: 'Home',     icon: 'home-outline' },
      { href: '/(admin)/academic',     label: 'Academic', icon: 'library-outline' },
      { href: '/(admin)/students',     label: 'Students', icon: 'people-outline' },
      { href: '/notifications',        label: 'Alerts',   icon: 'notifications-outline' },
      { href: '/profile',              label: 'Profile',  icon: 'person-outline' },
    ],
    more: [
      { href: '/(admin)/staff',                 label: 'Staff & Teachers',  icon: 'school-outline' },
      { href: '/(admin)/fees/heads',            label: 'Fee Heads',         icon: 'pricetags-outline' },
      { href: '/(admin)/fees/operations',       label: 'Finance Operations',icon: 'cash-outline' },
      { href: '/(admin)/fees/pending-payments', label: 'Fee Approvals',     icon: 'card-outline' },
      { href: '/(admin)/fees/defaulters',       label: 'Fee Defaulters',    icon: 'alert-circle-outline' },
      { href: '/(admin)/academic/timetable',    label: 'Timetable',         icon: 'calendar-outline' },
      { href: '/(admin)/academic/marks-grid',   label: 'Marks Entry',       icon: 'create-outline' },
      { href: '/(admin)/academic/merit-rank',   label: 'Merit Rank',        icon: 'trophy-outline' },
      { href: '/(admin)/promotion/preview',     label: 'Student Promotion', icon: 'trending-up-outline' },
      { href: '/(admin)/library/books',         label: 'Library',           icon: 'book-outline' },
      { href: '/(admin)/library/issued',        label: 'Book Circulation',  icon: 'swap-horizontal-outline' },
      { href: '/(admin)/transport/routes',      label: 'Transport',         icon: 'bus-outline' },
      { href: '/(admin)/transport/drivers',     label: 'Drivers & Vehicles',icon: 'id-card-outline' },
      { href: '/(admin)/transport/assignments', label: 'Assign Transport',  icon: 'link-outline' },
      { href: '/(admin)/reception/visitor-logs',label: 'Visitor Logs',      icon: 'clipboard-outline' },
      { href: '/(admin)/announcements',         label: 'Announcements',     icon: 'megaphone-outline' },
      { href: '/(admin)/reports',               label: 'Reports',           icon: 'document-text-outline' },
      { href: '/(admin)/academic/teacher-attendance', label: 'Teacher Attendance', icon: 'checkbox-outline' },
      { href: '/(admin)/fees/discounts',        label: 'Discount Approvals',       icon: 'pricetag-outline' },
    ],
  },

  Accountant: {
    portalName: 'Accounts',
    tabs: [
      { href: '/(admin)',                       label: 'Home',      icon: 'home-outline' },
      { href: '/(admin)/fees/pending-payments', label: 'Approvals', icon: 'checkmark-done-outline' },
      { href: '/(admin)/fees/defaulters',       label: 'Dues',      icon: 'alert-circle-outline' },
      { href: '/notifications',                 label: 'Alerts',    icon: 'notifications-outline' },
      { href: '/profile',                       label: 'Profile',   icon: 'person-outline' },
    ],
    more: [
      { href: '/(admin)/fees/heads',      label: 'Fee Heads',          icon: 'pricetags-outline' },
      { href: '/(admin)/fees/operations', label: 'Finance Operations', icon: 'cash-outline' },
      { href: '/(admin)/reports',         label: 'Reports',            icon: 'document-text-outline' },
    ],
  },

  Reception: {
    portalName: 'Reception',
    tabs: [
      { href: '/(admin)',                        label: 'Home',     icon: 'home-outline' },
      { href: '/(admin)/reception/visitor-logs', label: 'Visitors', icon: 'clipboard-outline' },
      { href: '/(admin)/students',               label: 'Students', icon: 'people-outline' },
      { href: '/notifications',                  label: 'Alerts',   icon: 'notifications-outline' },
      { href: '/profile',                        label: 'Profile',  icon: 'person-outline' },
    ],
    more: [
      { href: '/(admin)/reception/create-visitor', label: 'New Visitor Entry', icon: 'person-add-outline' },
    ],
  },

  Librarian: {
    portalName: 'Library',
    tabs: [
      { href: '/(admin)',                 label: 'Home',    icon: 'home-outline' },
      { href: '/(admin)/library/books',   label: 'Catalog', icon: 'book-outline' },
      { href: '/(admin)/library/overdue', label: 'Overdue', icon: 'time-outline' },
      { href: '/notifications',           label: 'Alerts',  icon: 'notifications-outline' },
      { href: '/profile',                 label: 'Profile', icon: 'person-outline' },
    ],
    more: [
      { href: '/(admin)/library/issued', label: 'Circulation', icon: 'swap-horizontal-outline' },
      { href: '/(admin)/reports', label: 'Reports', icon: 'document-text-outline' },
    ],
  },

  TransportManager: {
    portalName: 'Transport',
    tabs: [
      { href: '/(admin)',                  label: 'Home',    icon: 'home-outline' },
      { href: '/(admin)/transport/routes', label: 'Routes',  icon: 'bus-outline' },
      { href: '/notifications',            label: 'Alerts',  icon: 'notifications-outline' },
      { href: '/profile',                  label: 'Profile', icon: 'person-outline' },
    ],
    more: [
      { href: '/(admin)/transport/drivers',     label: 'Drivers & Vehicles', icon: 'id-card-outline' },
      { href: '/(admin)/transport/assignments', label: 'Assign Students',    icon: 'link-outline' },
      { href: '/(admin)/reports', label: 'Reports', icon: 'document-text-outline' },
    ],
  },

  Teacher: {
    portalName: 'Teacher',
    tabs: [
      { href: '/(teacher)',            label: 'Home',       icon: 'home-outline' },
      { href: '/(teacher)/attendance', label: 'Attendance', icon: 'checkbox-outline' },
      { href: '/(teacher)/homework',   label: 'Homework',   icon: 'book-outline' },
      { href: '/(teacher)/timetable',  label: 'Timetable',  icon: 'calendar-outline' },
      { href: '/profile',              label: 'Profile',    icon: 'person-outline' },
    ],
    more: [
      { href: '/notifications', label: 'Notifications', icon: 'notifications-outline' },
      { href: '/(teacher)/announcements', label: 'Announcements', icon: 'megaphone-outline' },
    ],
  },

  Student: {
    portalName: 'Student',
    tabs: [
      { href: '/(student)',           label: 'Home',      icon: 'home-outline' },
      { href: '/(student)/homework',  label: 'Homework',  icon: 'book-outline' },
      { href: '/(student)/timetable', label: 'Timetable', icon: 'calendar-outline' },
      { href: '/(student)/results',   label: 'Results',   icon: 'ribbon-outline' },
      { href: '/profile',             label: 'Profile',   icon: 'person-outline' },
    ],
    more: [
      { href: '/(student)/attendance',       label: 'My Attendance',    icon: 'checkbox-outline' },
      { href: '/(student)/announcements',    label: 'Announcements',    icon: 'megaphone-outline' },
      { href: '/(student)/academic-history', label: 'Academic History', icon: 'time-outline' },
      { href: '/notifications',              label: 'Notifications',    icon: 'notifications-outline' },
    ],
  },

  Parent: {
    portalName: 'Parent',
    tabs: [
      { href: '/(parent)',            label: 'Home',     icon: 'home-outline' },
      { href: '/(parent)/homework',   label: 'Homework', icon: 'book-outline' },
      { href: '/(parent)/fees',       label: 'Fees',     icon: 'card-outline' },
      { href: '/(parent)/results',    label: 'Results',  icon: 'ribbon-outline' },
      { href: '/profile',             label: 'Profile',  icon: 'person-outline' },
    ],
    more: [
      { href: '/(parent)/attendance',    label: "Child's Attendance", icon: 'checkbox-outline' },
      { href: '/(parent)/timetable',     label: 'Timetable',          icon: 'calendar-outline' },
      { href: '/(parent)/child-profile', label: 'Child Profile',      icon: 'person-circle-outline' },
      { href: '/(parent)/transport',     label: 'Transport',          icon: 'bus-outline' },
      { href: '/(parent)/announcements', label: 'Announcements',      icon: 'megaphone-outline' },
      { href: '/notifications',          label: 'Notifications',      icon: 'notifications-outline' },
      { href: '/(parent)/fees/discounts', label: 'Discount Requests', icon: 'pricetag-outline' },
    ],
  },
};

/** Safe lookup with a minimal fallback so an unknown role never crashes the shell. */
export function getRoleNav(roleName: string | undefined): RoleNav {
  if (roleName && ROLE_NAV[roleName]) return ROLE_NAV[roleName];
  return {
    portalName: roleName || 'Portal',
    tabs: [
      { href: '/',         label: 'Home',    icon: 'home-outline' },
      { href: '/profile',  label: 'Profile', icon: 'person-outline' },
    ],
    more: [],
  };
}