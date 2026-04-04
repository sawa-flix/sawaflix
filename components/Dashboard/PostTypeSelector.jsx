"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Upload, ArrowRightLeft, ArrowRight } from "lucide-react";

const cards = [
  {
    id: "post",
    label: "Post",
    subtitle: "Create & upload original content",
    description:
      "Upload music, stories, food recipes and other original cultural content directly to Sawaflix.",
    icon: Upload,
    href: "/creator-dashboard/upload",
    gradient: "from-red-600 to-rose-500",
    glow: "rgba(225,29,72,0.25)",
    border: "hover:border-red-500/60",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
  },
  {
    id: "transfer",
    label: "Transfer",
    subtitle: "Import from another platform",
    description:
      "Link content from TikTok, YouTube, or other platforms and publish it to your Sawaflix profile.",
    icon: ArrowRightLeft,
    href: "/creator-dashboard/post/transfer",
    gradient: "from-violet-600 to-indigo-500",
    glow: "rgba(124,58,237,0.25)",
    border: "hover:border-violet-500/60",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function PostTypeSelector() {
  const router = useRouter();

  return (
    <div className="min-h-[70vh] flex flex-col justify-center max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-black text-white tracking-tight">
          What would you like to do?
        </h1>
        <p className="text-gray-400 mt-3 text-base">
          Choose how you want to publish content to your Sawaflix profile.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              variants={cardVariants}
              onClick={() => router.push(card.href)}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              style={{
                boxShadow: `0 0 0 0 ${card.glow}`,
              }}
              className={`relative group text-left w-full bg-[#0D1117] border border-white/8 ${card.border} rounded-2xl p-8 transition-all duration-300 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30`}
            >
              {/* Background gradient pulse */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300 rounded-2xl`}
              />

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl ${card.iconBg} flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className={`${card.iconColor} w-7 h-7`} />
              </div>

              {/* Text */}
              <div className="space-y-1 mb-4">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {card.label}
                </h2>
                <p className={`text-sm font-semibold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.subtitle}
                </p>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {card.description}
              </p>

              {/* CTA arrow */}
              <div className="mt-8 flex items-center gap-2">
                <span
                  className={`text-sm font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
                >
                  Get started
                </span>
                <motion.span
                  className={card.iconColor}
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </div>

              {/* Bottom gradient button bar */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`}
              />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
