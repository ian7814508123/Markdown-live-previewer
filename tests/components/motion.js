import { motion } from "framer-motion";

const InteractiveLogo = () => {
    return (
        <motion.div
            style={{ display: "inline-block", cursor: "pointer" }}
            whileHover={{ scale: 1.05 }} // 懸停稍微放大
            whileTap={{ scale: 0.95 }}   // 點擊縮放感
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="none"
                viewBox="0 0 64 64"
            >
                {/* 背景方塊 */}
                <rect width="64" height="64" fill="#005b94" rx="16" />

                {/* 蛇形爬行的 M 字路徑 */}
                <motion.path
                    d="M18 46V18l14 16 14-16v28" // M 字主體
                    stroke="#fff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }} // 初始長度為 0
                    animate={{ pathLength: 1 }} // 爬行到 100%
                    transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                    }}
                />

                {/* 末端箭頭：等 M 字畫完後再像“彈”出來一樣顯示 */}
                <motion.path
                    d="m46 46-5-5m5 5 5-5" // 箭頭部分
                    stroke="#fff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        delay: 1.2, // 延遲直到 M 字快畫完
                        duration: 0.3,
                        type: "spring",
                        stiffness: 200
                    }}
                />
            </svg>
        </motion.div>
    );
};