const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const BASE_URL = "https://api.github.com";

const headers = {
  Accept: "application/vnd.github.v3+json",
  ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` }), //conditional spread
};

export const githubAPI = {
  // get user
  getUser: async (username) => {
    const res = await fetch(`${BASE_URL}/users/${username}`, { headers });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  },

  // get repos (default 12 for profile card)
  getRepos: async (username) => {
    const res = await fetch(`${BASE_URL}/users/${username}/repos?sort=updated&per_page=12`, { headers });
    if (!res.ok) throw new Error("Failed to fetch repos");
    return res.json();
  },

  // get all repos (for visualizations, up to 100)
  getAllRepos: async (username) => {
    const res = await fetch(`${BASE_URL}/users/${username}/repos?per_page=100&sort=updated`, { headers });
    if (!res.ok) throw new Error("Failed to fetch all repos");
    return res.json();
  },

  // get events (up to 100 for timeline and activity score)
  getEvents: async (username) => {
    const res = await fetch(`${BASE_URL}/users/${username}/events?per_page=100`, { headers });
    if (!res.ok) throw new Error("Failed to fetch activity");
    return res.json();
  },

  // search user
  searchUsers: async (query) => {
    const res = await fetch(`${BASE_URL}/search/users?q=${query}&per_page=5`, { headers });
    if (!res.ok) throw new Error("Search failed");
    return res.json();
  },
};
