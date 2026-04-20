import { motion } from "motion/react";
import { 
  Shield, 
  Users, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  Lock,
  Globe,
  LayoutDashboard,
  Calendar,
  BookOpen,
  LifeBuoy,
  Plus,
  ChevronRight,
GraduationCap,
MessageSquare
} from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side: Brand & Value Prop */}
      <div className="relative w-full md:w-1/2 bg-[#3f3d8f] overflow-hidden flex flex-col justify-between p-8 md:p-16 text-white">
        {/* Deep Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3f3d8f] via-[#4e4bb0] to-[#2d2b6b]" />
        
        {/* Blended Member Image Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
            alt="Members collaborating" 
            className="w-full h-full object-cover opacity-[0.30] mix-blend-luminosity grayscale"
            referrerPolicy="no-referrer"
          />
          {/* Extra gradient to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2d2b6b]/80 via-transparent to-transparent" />
        </div>

        {/* Secondary Color Overlay (The "Two Color Shade") */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-transparent mix-blend-multiply" />
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large soft glow - mimicking the original's light source */}
          <div className="absolute top-[-10%] right-[-10%] w-[90%] h-[90%] rounded-full bg-blue-400/25 blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-indigo-300/15 blur-[120px]" />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] mix-blend-overlay" />
          
          {/* Subtle floating shapes to mimic the original image's "confetti" feel */}
          <div className="absolute top-[15%] left-[10%] w-6 h-6 bg-white/10 rotate-45 rounded-sm blur-[1px] opacity-40" />
          <div className="absolute top-[40%] right-[15%] w-8 h-8 bg-blue-300/10 -rotate-12 rounded-full blur-[1px] opacity-30" />
          <div className="absolute bottom-[20%] right-[25%] w-5 h-5 bg-indigo-200/10 rotate-12 rounded-sm blur-[1px] opacity-40" />
          <div className="absolute top-[60%] left-[20%] w-4 h-4 bg-white/5 -rotate-45 rounded-full blur-[1px] opacity-20" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
            <Users className="w-8 h-8 text-white" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">MemberHub</span>
        </motion.div>

        <div className="relative z-10 mt-20 md:mt-0">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6"
          >
            Your Gateway to <br />
            <span className="text-blue-200">Excellence.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-blue-100 max-w-lg mb-12 leading-relaxed"
          >
            Manage your profile, track subscriptions, and handle payments in one secure, unified platform designed for our members.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {[
              { icon: LayoutDashboard, text: "Personal Dashboard" },
              { icon: LifeBuoy, text: "Issue Management" },
              { icon: Users, text: "Apply for Membership" },
              { icon: Calendar, text: "Events & Workshops" },
              { icon: BookOpen, text: "Member Resources" },
              { icon: GraduationCap, text: "Learning Courses" },
              { icon: MessageSquare, text: "Messages & Notifications" },
              { icon: CreditCard, text: "Secure Payments" }
              
              
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-50">
                <feature.icon className="w-5 h-5 text-blue-300" />
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="relative z-10 mt-12 md:mt-0 pt-8 border-t border-white/10 text-sm text-blue-200 flex flex-wrap gap-6"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Bank-grade encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Global accessibility</span>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Authentication */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-10 border border-slate-100"
        >
          {/* Section 1: Existing Users */}
          <div className="mb-10">
            <div className="flex justify-between items-start mb-6">
              <div className="text-left">
                <h2 className="text-xl font-display font-bold text-slate-900">Already signed up?</h2>
                <p className="text-sm text-slate-500 mt-1">Sign in to access your portal.</p>
              </div>
              <div className="hidden sm:block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                Secure SSO
              </div>
            </div>

            <div className="space-y-4">
              {/* Primary Button: Email Login */}
              <button 
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-900/20 group active:scale-[0.99]"
              >
                <Shield className="w-5 h-5 text-blue-200" />
                <span className="font-semibold text-sm sm:text-base">Sign in with your email</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-2 bg-white text-slate-400 font-bold uppercase tracking-widest">OR</span>
                </div>
              </div>

              {/* Social Login: Google */}
              <button 
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="Google" className="w-5 h-5" />
                <span className="font-semibold text-slate-700">Continue with Google</span>
              </button>
            </div>
          </div>

          <div className="relative py-6 mb-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest">First time here?</span>
            </div>
          </div>

          {/* Section 2: New Users */}
          <div className="text-center">
            <h3 className="text-lg font-display font-bold text-slate-900 mb-2">New to the portal?</h3>
            <p className="text-sm text-slate-500 mb-6 px-4">
              Apply for membership and create your account to access exclusive services.
            </p>
            
            <button className="w-full py-3 px-4 bg-[#EEF2FF] text-[#1E3A8A] font-bold rounded-xl hover:bg-[#E0E7FF] transition-all border border-[#CBD5E1] flex items-center justify-center gap-2 group">
              <Plus className="w-4 h-4" />
              Create an Account
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <div className="flex justify-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
              <span>Privacy</span>
              <span>•</span>
              <span>Terms</span>
              <span>•</span>
              <span>Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
