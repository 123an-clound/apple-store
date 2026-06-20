'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TEL_URL, ZALO_URL } from '@/lib/constants';

export default function FloatingContact({ hidden = false }) {
  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-8 right-6 md:bottom-[68px] md:right-[60px] z-[9999] flex flex-col gap-6 md:gap-[52px] transition-all duration-1000 opacity-100 translate-y-0"
          aria-label="Liên hệ nhanh"
        >
          {/* Zalo Button */}
          <motion.a
            href={ZALO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Zalo"
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                '0 0 20px rgba(0, 198, 255, 0.4), 0 0 40px rgba(0, 198, 255, 0.2)',
                '0 0 40px rgba(0, 198, 255, 0.8), 0 0 80px rgba(0, 198, 255, 0.4)',
                '0 0 20px rgba(0, 198, 255, 0.4), 0 0 40px rgba(0, 198, 255, 0.2)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            whileHover={{ 
              scale: 1.15,
              boxShadow: '0 0 60px rgba(0, 198, 255, 0.9), 0 0 120px rgba(0, 198, 255, 0.5)'
            }}
            whileTap={{ scale: 0.9 }}
            className="group relative w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,198,255,0.5)] bg-gradient-to-br from-[#00c6ff] to-[#0072ff] animate-liquid-neon contact-ripple"
          >
            {/* Multi-layer ripple effect */}
            <div className="absolute inset-0 rounded-full animate-ripple-1"></div>
            <div className="absolute inset-0 rounded-full animate-ripple-2"></div>
            <div className="absolute inset-0 rounded-full animate-ripple-3"></div>
            
            <div className="absolute inset-1 rounded-full bg-white/10 backdrop-blur-[2px] border border-white/20 group-hover:bg-white/30 transition-all"></div>
            <div className="relative z-10 transform scale-90 group-hover:scale-110 transition-transform duration-500 opacity-90">
              <svg viewBox="0 0 40 40" className="w-[26px] h-[26px] md:w-[44px] md:h-[44px] fill-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2C10.059 2 2 9.082 2 17.809c0 4.886 2.535 9.213 6.484 12.016L6.8 38l7.842-3.921c1.725.467 3.525.73 5.358.73C30.041 34.809 38 27.727 38 19c0-8.727-7.959-15.809-18-15.809z"></path>
                <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#0072ff" font-size="26" font-weight="900" fontFamily="Arial">Z</text>
              </svg>
            </div>
            
            {/* Continuous shine animation */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
            </div>

            {/* Tooltip on hover */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white text-xs md:text-sm font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Chat Zalo
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-gradient-to-r from-[#00c6ff] to-[#0072ff]"></div>
            </div>
          </motion.a>

          {/* Phone Button */}
          <motion.a
            href={TEL_URL}
            target="_self"
            rel="noopener noreferrer"
            aria-label="Phone"
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                '0 0 20px rgba(37, 99, 235, 0.4), 0 0 40px rgba(37, 99, 235, 0.2)',
                '0 0 40px rgba(37, 99, 235, 0.8), 0 0 80px rgba(37, 99, 235, 0.4)',
                '0 0 20px rgba(37, 99, 235, 0.4), 0 0 40px rgba(37, 99, 235, 0.2)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              delay: 1
            }}
            whileHover={{ 
              scale: 1.15,
              boxShadow: '0 0 60px rgba(37, 99, 235, 0.9), 0 0 120px rgba(37, 99, 235, 0.5)'
            }}
            whileTap={{ scale: 0.9 }}
            className="group relative w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)] bg-gradient-to-br from-[#2572ec] to-[#1e5ebc] animate-liquid-neon-reverse contact-ripple"
          >
            {/* Multi-layer ripple effect */}
            <div className="absolute inset-0 rounded-full animate-ripple-1"></div>
            <div className="absolute inset-0 rounded-full animate-ripple-2"></div>
            <div className="absolute inset-0 rounded-full animate-ripple-3"></div>

            <div className="absolute inset-1 rounded-full bg-white/10 backdrop-blur-[2px] border border-white/20 group-hover:bg-white/30 transition-all"></div>
            <div className="relative z-10 transform scale-90 group-hover:scale-110 transition-transform duration-500 opacity-90">
              <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-10 md:h-10 fill-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path>
                <circle cx="18" cy="6" r="3" fill="none" stroke="white" strokeWidth="2">
                  <animate attributeName="r" from="3" to="8" dur="1.2s" repeatCount="indefinite"></animate>
                  <animate attributeName="opacity" from="1" to="0" dur="1.2s" repeatCount="indefinite"></animate>
                </circle>
              </svg>
            </div>

            {/* Continuous shine animation */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
            </div>

            {/* Tooltip on hover */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gradient-to-r from-[#2572ec] to-[#1e5ebc] text-white text-xs md:text-sm font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Gọi ngay
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-gradient-to-r from-[#2572ec] to-[#1e5ebc]"></div>
            </div>
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
