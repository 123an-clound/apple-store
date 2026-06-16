'use client';

import { Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TEL_URL, ZALO_URL } from '@/lib/constants';

export default function FloatingContact({ hidden = false }) {
  return (
    <AnimatePresence>
      {!hidden && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            aria-label="Liên hệ nhanh"
          >
            <div className="glass-card rounded-t-[var(--radius-2xl)] rounded-b-none border border-[var(--border-subtle)] border-b-0 px-3 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.12)]">
              <div className="grid grid-cols-2 gap-3">
                <motion.a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat Zalo"
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: '0 0 35px rgba(37,99,235,0.7), 0 0 60px rgba(37,99,235,0.5)'
                  }}
                  whileTap={{ scale: 0.92 }}
                  className="flex items-center justify-center gap-2 h-12 rounded-[var(--radius-lg)] bg-[var(--color-info)] text-white font-semibold focus-ring touch-manipulation btn-neon btn-liquid"
                >
                  <MessageCircle size={18} className="icon-float" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' }} />
                  Zalo
                </motion.a>
                <motion.a
                  href={TEL_URL}
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: '0 0 35px rgba(50,55,74,0.7), 0 0 60px rgba(50,55,74,0.5)'
                  }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Gọi điện"
                  className="flex items-center justify-center gap-2 h-12 rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-white font-semibold focus-ring touch-manipulation btn-modern btn-shine-sweep"
                >
                  <Phone size={18} className="icon-float" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' }} />
                  Gọi ngay
                </motion.a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="hidden sm:block fixed bottom-4 right-3 sm:bottom-6 sm:right-5 z-40 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            aria-label="Liên hệ nhanh"
          >
            <div className="glass-card rounded-[var(--radius-xl)] p-1.5 sm:p-2 flex flex-col gap-1.5 sm:gap-2">
              <motion.a
                href={ZALO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat Zalo"
                whileHover={{ 
                  scale: 1.12,
                  rotate: 8,
                  boxShadow: '0 0 40px rgba(37,99,235,0.7), 0 0 70px rgba(37,99,235,0.5)'
                }}
                whileTap={{ scale: 0.88 }}
                className="flex items-center justify-center w-11 h-11 sm:min-h-[48px] sm:min-w-[48px] sm:px-3 rounded-full sm:rounded-[var(--radius-lg)] bg-[var(--color-info)] text-white hover:brightness-110 focus-ring touch-manipulation btn-neon btn-liquid"
              >
                <MessageCircle size={20} className="icon-float" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' }} />
              </motion.a>
              <motion.a
                href={TEL_URL}
                whileHover={{ 
                  scale: 1.12,
                  rotate: -8,
                  boxShadow: '0 0 40px rgba(50,55,74,0.7), 0 0 70px rgba(50,55,74,0.5)'
                }}
                whileTap={{ scale: 0.88 }}
                aria-label="Gọi điện"
                className="flex items-center justify-center w-11 h-11 sm:min-h-[48px] sm:min-w-[48px] sm:px-3 rounded-full sm:rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus-ring touch-manipulation btn-modern btn-shine-sweep"
              >
                <Phone size={20} className="icon-float" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' }} />
              </motion.a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
