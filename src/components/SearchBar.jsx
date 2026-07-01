import { useState } from 'react';
import { Search } from 'lucide-react';
import { githubAPI } from '../api/github';

const SearchBar = ({ setUser, setLoading, setError }) => {
  const [username, setUsername] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setIsSearching(true);
    setUser(null); // Clear previous user while searching

    try {
      const userData = await githubAPI.getUser(username.trim());
      setUser(userData);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(err.message || 'User not found. Please check the username.');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full group">
      <form onSubmit={handleSearch} className="relative">
        {/* Glow effect behind the search bar */}
        <div className="absolute -inset-1 bg-gradient-to-r from-zinc-600/30 to-blue-600/30 rounded-3xl blur-md opacity-50 group-hover:opacity-100 transition duration-500" />
        
        <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-2xl transition-all duration-300 group-hover:border-white/20 group-hover:bg-gray-900/90">
          <div className="pl-4 pr-2 text-gray-400">
            <Search className="w-6 h-6" />
          </div>
          
          <input  
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Search GitHub username..."
            className="flex-1 bg-transparent py-3 px-2 text-lg text-white placeholder-gray-500 focus:outline-none w-full"
            spellCheck={false}
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={isSearching || !username.trim()}
            className="relative overflow-hidden bg-white text-black hover:bg-gray-200 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform active:scale-95 ml-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isSearching ? 'Searching' : 'Search'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;