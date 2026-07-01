import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import SearchBar from "./components/SearchBar";
import ProfileCard from "./components/ProfileCard";
import UserDetailsPanel from "./components/UserDetailsPanel";
import { githubAPI } from "./api/github";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Preloader from "./components/Preloader";
import { motion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isPreloading, setIsPreloading] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1,
      },
    },
  };

  const topVariant = {
    hidden: {
      opacity: 0,
      y: -50,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const leftVariant = {
    hidden: {
      opacity: 0,
      x: -120,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  const rightVariant = {
    hidden: {
      opacity: 0,
      x: 120,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  const bottomVariant = {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <Preloader
        color="#0b0b0d"
        shimmer="rgba(255,255,255,0.16)"
        minDuration={1200}
        onComplete={() => setIsPreloading(false)}
      >
        <div
          className={`min-h-screen relative overflow-x-hidden bg-black text-slate-200  transition-opacity duration-[1500ms] ${isPreloading ? "opacity-0 h-screen overflow-hidden" : "opacity-100"}`}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="fixed inset-0 w-full h-full object-cover pointer-events-none"
          >
            <source
              src="https://res.cloudinary.com/autjby7r/video/upload/v1782909566/bg-githubecho_p5gt9h.webm"
              type="video/webm"
            />
          </video>

          <motion.div
            className="relative z-10 w-full min-h-screen md:p-4 flex flex-col items-center justify-between bg-black/80"
            variants={containerVariants}
            initial="hidden"
            animate={!isPreloading ? "visible" : "hidden"}
          >
            <div className="p-4 flex justify-between items-center text-white  w-full max-md:flex-col ">
              <motion.h1
                className="animate-pulse text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white/70  tracking-tight flex items-center justify-center gap-4"
                variants={topVariant}
              >
                GitHub Echo{" "}
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-purple-400 animate-pulse" />
              </motion.h1>

              <motion.p
                className="text-slate-400 text-lg md:text-xl font-light max-[380px]:text-sm"
                variants={topVariant}
              >
                Discover developers across the world
              </motion.p>
            </div>

            <div className="flex flex-col justify-center  items-center gap-2  uppercase font-extrabold text-7xl md:text-8xl lg:text-9xl">
              <p className="flex justify-center items-center gap-2 max-[550px]:flex-col">
                <motion.span variants={rightVariant}>every</motion.span>

                <motion.span variants={leftVariant}>profile</motion.span>
              </p>

              <p className="flex justify-center items-center gap-2  max-[550px]:flex-col">
                <motion.span variants={rightVariant}>tells a</motion.span>

                <motion.span variants={leftVariant}>story</motion.span>
              </p>
            </div>

            <div className="flex items-center text-slate-400 justify-between w-full max-[590px]:flex-col max-[680px]:text-sm p-1">
              <motion.p variants={bottomVariant}>
                Open Source Inspired ©
              </motion.p>
              <motion.p variants={bottomVariant}>
                Search any GitHub username
              </motion.p>
              <motion.p variants={bottomVariant}>
                SCROLL TO EXPLORE PROFILE
              </motion.p>
            </div>
          </motion.div>

          <div className="relative z-10 w-full max-w-[1400px] mx-auto py-12 lg:py-20 flex flex-col items-center min-h-screen bg-black/80">
            {/* Header Section */}
            <div className="flex flex-col items-center mb-12 animate-fade-in-up w-full text-center px-6 lg:px-10">
              <div className="inline-flex items-center justify-center p-4 mb-6 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md">
                <FaGithub className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white/70 mb-6 tracking-tight flex items-center justify-center gap-4">
                GitHub Echo{" "}
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-purple-400 animate-pulse" />
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-light">
                Discover developers with a holographic, premium profile
                experience.
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-2xl mb-24 z-20 px-6 lg:px-10">
              <SearchBar
                setUser={setUser}
                setLoading={setLoading}
                setError={setError}
              />
            </div>

            {/* Status & Content */}
            <div className="w-full flex justify-center items-start flex-1">
              {loading && (
                <div className="flex flex-col items-center justify-center mt-20 space-y-4 animate-pulse">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                  <p className="text-purple-300 font-medium tracking-widest uppercase text-sm">
                    Synthesizing Profile...
                  </p>
                </div>
              )}

              {error && !loading && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl backdrop-blur-md animate-shake mt-10">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {user && !loading && !error && (
                <div className="w-full flex flex-col items-center mt-4">
                  <div className="relative z-10 flex-shrink-0 flex flex-col items-center w-full">
                    <div className="flex flex-col lg:flex-row lg:items-stretch items-center justify-center w-full relative h-fit lg:px-10">
                      <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 px-6 lg:px-0 flex flex-col">
                        <ProfileCard
                          className="w-full h-full"
                          name={user.name}
                          title={user.bio || user.location || "Developer"}
                          handle={user.login}
                          status={
                            user.hireable
                              ? "Available for hire"
                              : "Active Developer"
                          }
                          avatarUrl={user.avatar_url}
                          showUserInfo={true}
                          enableTilt={true}
                          enableMobileTilt={false}
                          behindGlowColor="rgba(125, 190, 255, 0.67)"
                          iconUrl="/assets/demo/iconpattern.png"
                          behindGlowEnabled
                          innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
                        />
                      </div>

                      <UserDetailsPanel user={user} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Preloader>
    </>
  );
}

export default App;
