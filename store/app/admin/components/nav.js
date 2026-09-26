import { LayoutDashboard, Smartphone, Images, Users, History, Settings, ShieldCheck } from 'lucide-react';

export const NAV = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, min: 'viewer' },
  { href: '/admin/san-pham', label: 'Sản phẩm', icon: Smartphone, min: 'viewer' },
  { href: '/admin/anh', label: 'Thư viện ảnh', icon: Images, min: 'viewer' },
  { href: '/admin/khach-hang', label: 'Khách hàng', icon: Users, min: 'viewer', badge: 'leads' },
  { href: '/admin/lich-su', label: 'Lịch sử thay đổi', icon: History, min: 'viewer' },
  { href: '/admin/cai-dat', label: 'Cài đặt', icon: Settings, min: 'viewer' },
  { href: '/admin/quan-tri', label: 'Quản trị viên', icon: ShieldCheck, min: 'owner' },
];
