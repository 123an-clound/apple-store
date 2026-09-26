'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '../../actions';
import FormMessage from '../../components/FormMessage';

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);
  return (
    <>
      <h1 className="text-xl font-semibold">Quên mật khẩu</h1>
      <p className="a-muted mt-1 mb-6 text-sm">Nhập email, chúng tôi gửi link đặt lại mật khẩu.</p>
      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="a-label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="a-input" />
        </div>
        <FormMessage state={state} success="Nếu email tồn tại, link đặt lại đã được gửi. Kiểm tra hộp thư." />
        <button type="submit" disabled={pending} className="a-btn a-btn-primary w-full">
          {pending ? 'Đang gửi…' : 'Gửi link đặt lại'}
        </button>
        <Link href="/admin/login" className="block text-center text-sm text-[var(--color-accent)] hover:underline">Quay lại đăng nhập</Link>
      </form>
    </>
  );
}
