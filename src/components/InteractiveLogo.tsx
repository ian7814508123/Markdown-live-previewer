import React from 'react';
import { motion, Variants } from 'framer-motion';

interface InteractiveLogoProps {
  className?: string;
  size?: number;
  variant?: 'v1' | 'v2';
}

const InteractiveLogo: React.FC<InteractiveLogoProps> = ({ className, size = 40, variant = 'v1' }) => {
  // Define paths for both versions
  const paths = {
    v1: {
      m: "M 18 46 V 18 L 32 34 L 46 18 V 46",
      arrowHead: [
        "M 46 46 L 41 41",
        "M 46 46 L 51 41"
      ]
    },
    v2: {
      m: "M 14 42 L 24 16 L 32 38 L 40 16 L 50 45",
      arrowHead: [
        "M 50 47 L 43 44",
        "M 50 47 L 55 43"
      ]
    }
  };

  const currentPaths = paths[variant];

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
        duration: 1.2,
        ease: "easeInOut",
      }
    }
  };

  const arrowVariants: Variants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: 1.2,
        duration: 0.5,
        ease: "easeOut",
      }
    },
    hover: {
      pathLength: [0, 1],
      opacity: 1,
      transition: {
        delay: 0.8,
        duration: 0.4,
        ease: "easeOut",
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
      >
        <motion.path
          d={currentPaths.m}
          stroke="var(--logo-stroke)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
        />

        {currentPaths.arrowHead.map((d, index) => (
          <motion.path
            key={index}
            d={d}
            stroke="var(--logo-stroke)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={arrowVariants}
          />
        ))}

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
