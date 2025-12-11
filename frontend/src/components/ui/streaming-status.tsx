import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Database, Brain, Sparkles, CheckCircle2 } from "lucide-react";

interface StreamingStatusProps {
  isStreaming: boolean;
  currentStep: number;
  sportName: string;
}

const steps = [
  { id: 0, label: "Initializing", icon: Loader2, color: "text-wicky-green" },
  { id: 1, label: "Loading data", icon: Database, color: "text-wicky-green" },
  { id: 2, label: "Processing with Gemini AI", icon: Brain, color: "text-wicky-green" },
  { id: 3, label: "Streaming insights", icon: Sparkles, color: "text-wicky-green" },
  { id: 4, label: "Complete!", icon: CheckCircle2, color: "text-success" },
];

export const StreamingStatus = ({ isStreaming, currentStep, sportName }: StreamingStatusProps) => {
  if (!isStreaming && currentStep === 0) return null;

  const currentStepData = steps[currentStep] || steps[0];
  const Icon = currentStepData.icon;
  const isComplete = currentStep === 4;

  return (
    <AnimatePresence mode="wait">
      {(isStreaming || currentStep > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative mb-6"
        >
          {/* Main Status Card */}
          <div className="relative overflow-hidden rounded-xl border border-wicky-green/30 bg-gradient-to-br from-wicky-green/5 via-card to-card backdrop-blur-sm">
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-wicky-green/10 to-transparent"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ width: "50%" }}
            />

            <div className="relative p-6">
              <div className="flex items-center gap-4">
                {/* Animated Icon */}
                <motion.div
                  animate={{
                    rotate: isComplete ? 0 : 360,
                    scale: isComplete ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    rotate: {
                      duration: 2,
                      repeat: isComplete ? 0 : Infinity,
                      ease: "linear",
                    },
                    scale: {
                      duration: 0.5,
                    },
                  }}
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    isComplete ? "bg-success/20" : "bg-wicky-green/20"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${currentStepData.color}`}
                    strokeWidth={2.5}
                  />
                </motion.div>

                {/* Status Text */}
                <div className="flex-1">
                  <motion.h3
                    key={currentStep}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-lg font-semibold text-wicky-green mb-1"
                  >
                    {currentStepData.label}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-muted-foreground"
                  >
                    {isComplete
                      ? `${sportName} insights generated successfully`
                      : `Analyzing ${sportName} data...`}
                  </motion.p>
                </div>

                {/* Pulse indicator */}
                {!isComplete && (
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-3 h-3 rounded-full bg-wicky-green"
                  />
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round((currentStep / 4) * 100)}%</span>
                </div>
                <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-wicky-green to-wicky-green-light"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 4) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Step Indicators */}
              <div className="mt-4 flex items-center justify-between">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <div
                      key={step.id}
                      className="flex flex-col items-center gap-1 flex-1"
                    >
                      <motion.div
                        animate={{
                          scale: isActive ? [1, 1.2, 1] : 1,
                          backgroundColor: isCompleted || isActive
                            ? "rgba(10, 207, 151, 0.8)"
                            : "rgba(10, 207, 151, 0.2)",
                        }}
                        transition={{
                          scale: {
                            duration: 1,
                            repeat: isActive ? Infinity : 0,
                            ease: "easeInOut",
                          },
                        }}
                        className="w-2 h-2 rounded-full"
                      />
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActive ? 1 : 0.5 }}
                        className={`text-[10px] text-center ${
                          isActive ? "text-wicky-green font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        {step.label.split(" ")[0]}
                      </motion.span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shimmer effect overlay */}
            {!isComplete && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
                style={{ width: "50%" }}
              />
            )}
          </div>

          {/* Floating particles effect */}
          {!isComplete && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-wicky-green rounded-full"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: "50%",
                  }}
                  animate={{
                    y: [-20, -40, -20],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};


