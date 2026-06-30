import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import SearchBar from './components/SearchBar';
import ProfileCard from './components/ProfileCard';
import UserDetailsPanel from './components/UserDetailsPanel';
import AnimatedBackground from './components/AnimatedBackground';
import { githubAPI } from './api/github';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GsapSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, 
        { opacity: 0, y: 100, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 1.2,
          delay: delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [delay]);

  return <div ref={ref} className="w-full flex justify-center mb-16 md:mb-32">{children}</div>;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    setIsDetailsOpen(false);
  }, [user]);

  // Refresh ScrollTrigger when layout changes (e.g., details panel opens)
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [isDetailsOpen, user, loading]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030014] text-slate-200 selection:bg-purple-500/30 ">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-20 flex flex-col items-center min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-12 animate-fade-in-up w-full text-center">
          <div className="inline-flex items-center justify-center p-4 mb-6 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md">
            <FaGithub className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white/70 mb-6 tracking-tight flex items-center justify-center gap-4">
            GitHub Echo <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-purple-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-light">
            Discover developers with a holographic, premium profile experience.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-24 z-20">
          <SearchBar setUser={setUser} setLoading={setLoading} setError={setError} />
        </div>

        {/* Status & Content */}
        <div className="w-full flex justify-center items-start flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center mt-20 space-y-4 animate-pulse">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="text-purple-300 font-medium tracking-widest uppercase text-sm">Synthesizing Profile...</p>
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
              
              <GsapSection delay={0.2}>
                <div className="relative z-10 flex-shrink-0 flex flex-col items-center w-full">
                  <div className="flex justify-center w-full relative h-fit">
                    <ProfileCard
                      name={user.name}
                      title={user.bio || user.location || "Developer"}
                      handle={user.login}
                      status={user.hireable ? "Available for hire" : "Active Developer"}
                      contactText={isDetailsOpen ? "Close Details" : "View Details"}
                      avatarUrl={user.avatar_url}
                      showUserInfo={true}
                      enableTilt={true}
                      enableMobileTilt={false}
                      onContactClick={() => setIsDetailsOpen(!isDetailsOpen)}
                      behindGlowColor="rgba(125, 190, 255, 0.67)"
                      iconUrl="/assets/demo/iconpattern.png"
                      behindGlowEnabled
                      innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
                    />

                    <UserDetailsPanel 
                      user={user} 
                      isOpen={isDetailsOpen} 
                      onClose={() => setIsDetailsOpen(false)} 
                    />
                  </div>
                  
                  {/* Indicator/Direction Hint */}
                  {!isDetailsOpen && (
                    <div className=" flex flex-col items-center animate-bounce gap-2 pointer-events-none opacity-80">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                      </svg>
                      <span className="text-xs font-semibold text-purple-200 tracking-wider bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 whitespace-nowrap shadow-lg">
                        Click View Details
                      </span>
                    </div>
                  )}
                </div>
              </GsapSection>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;