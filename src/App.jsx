import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import SearchBar from "./components/SearchBar";
import ProfileCard from "./components/ProfileCard";
import UserDetailsPanel from "./components/UserDetailsPanel";
import AnimatedBackground from "./components/AnimatedBackground";
import CanvasPreloader from "./components/CanvasPreloader";
import { githubAPI } from "./api/github";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GsapSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 100, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          delay: delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={ref} className="w-full flex justify-center mb-16 md:mb-32">
      {children}
    </div>
  );
};

function App() {
  const [isPreloading, setIsPreloading] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <>
      {isPreloading && (
        <CanvasPreloader onComplete={() => setIsPreloading(false)} />
      )}

      <div
        className={`min-h-screen relative overflow-x-hidden bg-black text-slate-200 selection:bg-purple-500/30 transition-opacity duration-[1500ms] ${isPreloading ? "opacity-0 h-screen overflow-hidden" : "opacity-100"}`}
      >
        <AnimatedBackground />

        <div className="relative z-10 w-full max-w-[1400px] mx-auto py-12 lg:py-20 flex flex-col items-center min-h-screen">
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
    </>
  );
}

export default App;
