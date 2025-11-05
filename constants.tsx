
import React from 'react';
import { Tool, Review } from './types';

const YouTubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 C3.326,4.648,2.648,5.326,2.418,6.186C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
    </svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);
const HashtagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M5 9h14M5 15h14" />
    </svg>
);
const SeoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const ScoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const TrendingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);


export const TOOLS: Tool[] = [
    { id: 'youtube-title', name: 'YouTube Title Generator', description: 'Generate catchy, SEO-optimized YouTube titles instantly.', icon: <YouTubeIcon />, model: 'gemini-2.5-flash', prompt: (input) => `Generate 5 catchy, SEO-optimized YouTube titles for a video about: "${input}". Return as a numbered list.` },
    { id: 'youtube-description', name: 'YouTube Description Generator', description: 'Write powerful, engaging, keyword-rich descriptions.', icon: <YouTubeIcon />, model: 'gemini-2.5-flash', prompt: (input) => `Write a powerful, engaging, and keyword-rich YouTube description for a video about: "${input}". Include relevant hashtags.` },
    { id: 'username', name: 'Username Generator', description: 'Suggests unique, creative usernames for any platform.', icon: <UserIcon />, model: 'gemini-2.5-flash-lite', prompt: (input) => `Generate 10 unique and creative usernames related to the keyword: "${input}". Return as a numbered list.` },
    { id: 'slogan', name: 'Slogan / Tagline Generator', description: 'Creates catchy brand slogans and taglines.', icon: <LightbulbIcon />, model: 'gemini-2.5-flash', prompt: (input) => `Generate 5 catchy slogans or taglines for a brand or product related to: "${input}". Return as a numbered list.` },
    { id: 'hashtag', name: 'Hashtag Generator', description: 'Produces trending and niche-targeted hashtags.', icon: <HashtagIcon />, model: 'gemini-2.5-flash', prompt: (input) => `Generate a list of 15 trending and niche-targeted hashtags for content about: "${input}".` },
    { id: 'seo-optimizer', name: 'YouTube SEO Optimizer', description: 'Get suggestions to optimize your title and description.', icon: <SeoIcon />, model: 'gemini-2.5-pro', isComplex: true, needsSecondaryInput: true, secondaryInputLabel: "Description", secondaryInputPlaceholder: "Enter video description here...", prompt: (title, description) => `Analyze the following YouTube video title and description for SEO. Provide detailed suggestions for improvement on both the title and description, including keywords. Title: "${title}" Description: "${description}". Format your response using markdown.` },
    { id: 'seo-score', name: 'SEO Score Checker', description: 'Displays score analysis for any entered title/description.', icon: <ScoreIcon />, model: 'gemini-2.5-pro', isComplex: true, needsSecondaryInput: true, secondaryInputLabel: "Description", secondaryInputPlaceholder: "Enter video description here...", prompt: (title, description) => `Analyze the following YouTube video title and description for SEO effectiveness. Provide a score from 0 to 100 and a detailed breakdown of what is good and what can be improved. Consider keyword usage, clarity, engagement potential, and length. Title: "${title}" Description: "${description}". Format your response using markdown with the score prominent at the top.` },
    { id: 'trending', name: 'Trending Generator', description: 'Shows daily viral topic suggestions based on trends.', icon: <TrendingIcon />, model: 'gemini-2.5-flash', useSearch: true, prompt: (input) => `Based on current trends, generate 5 viral video ideas or topics related to "${input}". If the input is empty, provide 5 general viral topic suggestions for today. Return as a numbered list.` },
];

export const REVIEWS: Review[] = [
    { name: 'Emily R.', avatar: 'https://i.pravatar.cc/150?img=1', rating: 5, text: 'Genora completely changed my content game! Super fast and creative.' },
    { name: 'Raj Mehta', avatar: 'https://i.pravatar.cc/150?img=2', rating: 4, text: 'Beautiful design and AI accuracy is impressive!' },
    { name: 'Liam S.', avatar: 'https://i.pravatar.cc/150?img=3', rating: 5, text: 'I use Genora daily for YouTube optimization — it’s just perfect.' },
    { name: 'Sophia Chen', avatar: 'https://i.pravatar.cc/150?img=4', rating: 5, text: 'The hashtag generator is a lifesaver for my Instagram posts.' },
];
