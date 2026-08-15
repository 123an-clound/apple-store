'use client';

import { AnimatePresence } from 'framer-motion';

// Wraps the @modal parallel-route slot so ProductModal's exit animation (backdrop
// fade, sheet slide-down) can still play when router.back() removes the
// intercepted route — without an ancestor AnimatePresence, Next.js would unmount
// the slot instantly and skip the exit transition entirely.
export default function ModalSlot({ children }) {
  return <AnimatePresence>{children}</AnimatePresence>;
}
