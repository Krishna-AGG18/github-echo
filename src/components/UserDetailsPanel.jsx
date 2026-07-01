import {
  MapPin,
  Briefcase,
  Link as LinkIcon,
  Mail,
  Calendar,
} from "lucide-react";
import { FaGithub, FaTwitter } from "react-icons/fa";

const DetailItem = ({ icon: Icon, label, value, link }) => {
  if (!value) return null;

  const content = (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-300">
        <Icon size={18} />
      </div>
      <div className="overflow-hidden">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );

  return link ? (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full outline-none focus:ring-2 focus:ring-white/20 rounded-xl"
    >
      {content}
    </a>
  ) : (
    <div className="w-full">{content}</div>
  );
};

const UserDetailsPanel = ({ user }) => {
  if (!user) return null;

  return (
    <div className="transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden w-full lg:w-auto max-h-[1200px] lg:max-h-none lg:max-w-[800px] opacity-100 mt-6 lg:mt-0 lg:ml-8 flex-1">
      <div className="w-full h-full min-h-[500px] backdrop-blur-3xl bg-white/[0.03] border-y lg:border border-white/10 rounded-none lg:rounded-[30px] p-6 lg:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col relative before:absolute before:inset-0 before:rounded-none lg:before:rounded-[30px] before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none">
        {/* Header */}
        <div className="mb-6 relative z-10">
          <h2 className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Developer Profile
          </h2>
          <p className="text-xs text-slate-400 mt-1">Detailed Synthesis</p>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-6 relative z-10">
            <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-white/20 pl-4 py-1">
              "{user.bio}"
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
          <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">
              {user.public_repos}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              Repositories
            </span>
          </div>
          <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">
              {user.followers}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              Followers
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 relative z-10 flex-1 overflow-y-auto pr-1 content-start">
          <DetailItem icon={MapPin} label="Location" value={user.location} />
          <DetailItem icon={Briefcase} label="Company" value={user.company} />
          <DetailItem
            icon={LinkIcon}
            label="Website"
            value={user.blog}
            link={
              user.blog?.startsWith("http")
                ? user.blog
                : user.blog
                  ? `https://${user.blog}`
                  : null
            }
          />
          <DetailItem
            icon={Mail}
            label="Email"
            value={user.email}
            link={user.email ? `mailto:${user.email}` : null}
          />
          <DetailItem
            icon={FaTwitter}
            label="Twitter"
            value={user.twitter_username}
            link={
              user.twitter_username
                ? `https://twitter.com/${user.twitter_username}`
                : null
            }
          />
          <DetailItem
            icon={Calendar}
            label="Joined"
            value={
              user.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : null
            }
          />
        </div>

        {/* View on GitHub Button */}
        <div className="mt-6 relative z-10">
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/20 transition-colors backdrop-blur-md"
          >
            <FaGithub size={20} />
            <span>Open GitHub Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPanel;
