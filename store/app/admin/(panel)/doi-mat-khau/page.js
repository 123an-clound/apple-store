'use client';

import { useActionState } from 'react';
import { updatePassword } from '../../actions';
import PageHeader from '../../components/PageHeader';
import FormMessage from '../../components/FormMessage';

export default function ChangePasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, null);
  return (
    <>
      <PageHeader title="Đổi mật khẩu" description="Tối thiểu 10 ký tự. Nên dùng trình quản lý mật khẩu." />
      <form action={action} className="a-card max-w-md space-y-4 p-5 sm:p-6">
        <div>
          <label htmlFor="password" className="a-label">Mật khẩu mới</label>
          <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className="a-input" />
        </div>
        <div>
          <label htmlFor="confirm" className="a-label">Nhập lại mật khẩu</label>
          <input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" className="a-input" />
        </div>
        <FormMessage state={state} success="Đã đổi mật khẩu." />
        <button type="submit" disabled={pending} className="a-btn a-btn-primary">{pending ? 'Đang lưu…' : 'Đổi mật khẩu'}</button>
      </form>
    </>
  );
}
