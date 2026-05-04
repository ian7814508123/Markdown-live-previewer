import React from 'react';
import { motion, Variants, useMotionValue, useTransform } from 'framer-motion';

interface InteractiveLogoProps {
  className?: string;
  size?: number;
  variant?: 'v1' | 'v2';
}

const InteractiveLogo: React.FC<InteractiveLogoProps> = ({ className, size = 40, variant = 'v1' }) => {
  // 建立進度值，由 0 到 1
  const progress = useMotionValue(0);

  // 定義路徑
  const paths = {
    v1: {
      m: "M 18 46 V 18 L 32 34 L 46 18 V 46",
      arrow: "M -6 -5 L 0 0 L -6 5" // 指向右方 (+X)，配合 offsetRotate: auto
    },
    v2: {
      m: "M 14 42 L 24 16 L 32 38 L 40 16 L 50 42",
      arrow: "M -6 -5 L 0 0 L -6 5"
    }
  };

  const currentPaths = paths[variant];

  // 轉換進度為 offsetDistance 的百分比字串
  const offsetDistance = useTransform(progress, [0, 1], ["0%", "100%"]);

  const containerVariants: Variants = {
    initial: {},
    hover: {},
  };

  const pathVariants: Variants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeInOut",
      }
    },
    hover: {
      pathLength: [0, 1],
      opacity: 1,
      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))",
      transition: {
        duration: 1.5,
        ease: "easeInOut",
      }
    }
  };

  const arrowVariants: Variants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      }
    },
    hover: {
      opacity: [0, 1],
      scale: [0.8, 1],
      transition: {
        duration: 0.3,
      }
    }
  };

  return (
    <motion.div
      key={variant}
      className={`relative flex items-center justify-center rounded-2xl overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: "var(--logo-bg)",
        backdropFilter: "blur(var(--logo-blur))",
        WebkitBackdropFilter: "blur(var(--logo-blur))",
        border: "1px solid var(--logo-border)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
      }}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap={{
        backdropFilter: "blur(calc(var(--logo-blur) / 2))",
        scale: 0.92
      }}
      variants={containerVariants}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
      >
        {/* 主路徑：負責畫線 */}
        <motion.path
          d={currentPaths.m}
          stroke="var(--logo-stroke)"
          strokeWidth="4"
          variants={pathVariants}
          onUpdate={(latest: any) => {
            if (latest.pathLength !== undefined) {
              progress.set(latest.pathLength);
            }
          }}
        />

        {/* 火車頭：箭頭群組 */}
        <motion.g
          style={{
            offsetPath: `path("${currentPaths.m}")`,
            offsetDistance: offsetDistance,
            offsetRotate: "auto",
          }}
          variants={arrowVariants}
        >
          <path
            d={currentPaths.arrow}
            stroke="var(--logo-stroke)"
            strokeWidth="4"
            fill="none"
          />
        </motion.g>
      </svg>

      <motion.div
        className="absolute inset-0 bg-white/5 pointer-events-none"
        initial={{ opacity: 0 }}
        variants={{
          hover: { opacity: 1 }
        }}
      />
    </motion.div>
  );
};

export default InteractiveLogo;
