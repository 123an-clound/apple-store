'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signIn } from '../../actions';
import FormMessage from '../../components/FormMessage';

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="a-label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="a-input" autoFocus defaultValue={state?.email} key={state?.email} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="a-label">Mật khẩu</label>
          <Link href="/admin/quen-mat-khau" className="mb-1.5 text-[13px] text-[var(--color-accent)] hover:underline">Quên mật khẩu?</Link>
        </div>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="a-input" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="a-btn a-btn-primary w-full">
        {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
    </form>
  );
}
