'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ConfirmContext = createContext(async () => false);

// const ok = await confirm('Xoá 3 sản phẩm?', { danger: true, confirmLabel: 'Xoá' })
export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
  const [req, setReq] = useState(null);
  const dialogRef = useRef(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((message, opts = {}) => {
    setReq({ message, ...opts });
    // Opened after render so the dialog exists; showModal gives a native focus trap + Esc.
    requestAnimationFrame(() => dialogRef.current?.showModal());
    return new Promise((resolve) => { resolveRef.current = resolve; });
  }, []);

  const finish = (value) => {
    dialogRef.current?.close();
    resolveRef.current?.(value);
    resolveRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog ref={dialogRef} onClose={() => finish(false)} aria-labelledby="confirm-title"
        className="m-auto w-[min(420px,calc(100vw-2rem))] rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 text-[var(--fg)] shadow-2xl backdrop:bg-black/40">
        <h2 id="confirm-title" className="text-base font-semibold">{req?.title ?? 'Xác nhận'}</h2>
        <p className="a-muted mt-2 text-sm">{req?.message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="a-btn a-btn-ghost" onClick={() => finish(false)} autoFocus>Huỷ</button>
          <button type="button" className={`a-btn ${req?.danger ? 'a-btn-danger' : 'a-btn-primary'}`} onClick={() => finish(true)}>
            {req?.confirmLabel ?? 'Đồng ý'}
          </button>
        </div>
      </dialog>
    </ConfirmContext.Provider>
  );
}
