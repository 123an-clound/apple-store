'use client';

import { AnimatePresence, useReducedMotion } from 'framer-motion';
import * as m from 'framer-motion/m';
import { MessageCircle, Phone } from 'lucide-react';
import { useContact } from '@/components/ContactProvider';

export default function FloatingContact({ hidden = false }) {
  const { telUrl, zaloUrl } = useContact();
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {!hidden && (
        <m.aside className="floating-contact" aria-label="Liên hệ nhanh"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <a href={zaloUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat Zalo" className="floating-contact-zalo"><MessageCircle size={20} aria-hidden="true" /><span>Zalo</span></a>
          <a href={telUrl} aria-label="Gọi ngay" className="floating-contact-phone"><Phone size={19} aria-hidden="true" /><span>Gọi ngay</span></a>
        </m.aside>
      )}
    </AnimatePresence>
  );
}
