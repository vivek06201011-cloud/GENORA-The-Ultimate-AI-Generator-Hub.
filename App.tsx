
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TOOLS, REVIEWS } from './constants';
import { ToolModal } from './components/ToolModal';
import { ChatBot } from './components/ChatBot';
import type { Tool, ToolState, Review } from './types';

// --- Custom Hooks ---
const useAnimatedCounter = (target: number, duration = 2000) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    let start = 0;
                    const end = target;
                    if (start === end) return;

                    let startTimestamp: number | null = null;
                    const step = (timestamp: number) => {
                        if (!startTimestamp) startTimestamp = timestamp;
                        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                        setCount(Math.floor(progress * (end - start) + start));
                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        }
                    };
                    window.requestAnimationFrame(step);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [target, duration]);

    return { count, ref };
};

const useIntersectionObserver = (options?: IntersectionObserverInit) => {
    const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(([entry]) => {
             if (entry.isIntersecting) {
                setEntry(entry);
                observer.current?.unobserve(entry.target);
            }
        }, options);

        const { current: currentObserver } = observer;
        if (ref.current) {
            currentObserver.observe(ref.current);
        }

        return () => currentObserver.disconnect();
    }, [options]);

    return { ref, isVisible: !!entry };
};

// --- Animated Section Wrapper ---
const AnimatedSection: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
    return (
      <div
        ref={ref}
        className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        {children}
      </div>
    );
};


// --- App Component ---
export default function App() {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const [toolStates, setToolStates] = useState<Record<string, ToolState>>(() => {
        const initialState: Record<string, ToolState> = {};
        TOOLS.forEach(tool => {
            initialState[tool.id] = {
                input: '',
                secondaryInput: '',
                output: '',
                history: [],
            };
        });
        return initialState;
    });
    
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
    
    // Load history from localStorage on initial render
    useEffect(() => {
        const savedHistories = localStorage.getItem('genoraHistories');
        if (savedHistories) {
            const histories = JSON.parse(savedHistories);
            setToolStates(prevStates => {
                const newStates = { ...prevStates };
                Object.keys(histories).forEach(toolId => {
                    if (newStates[toolId]) {
                        newStates[toolId].history = histories[toolId];
                    }
                });
                return newStates;
            });
        }
    }, []);

    const updateToolState = useCallback((toolId: string, newState: Partial<ToolState>) => {
        setToolStates(prev => {
            const updatedState = { ...prev[toolId], ...newState };
            const newStates = { ...prev, [toolId]: updatedState };

            // Save history to localStorage whenever it changes
            if(newState.history) {
                 const allHistories = Object.keys(newStates).reduce((acc, id) => {
                    acc[id] = newStates[id].history;
                    return acc;
                }, {} as Record<string, any>);
                localStorage.setItem('genoraHistories', JSON.stringify(allHistories));
            }

            return newStates;
        });
    }, []);

    const openToolModal = (tool: Tool) => {
        setActiveTool(tool);
    };

    const closeToolModal = () => {
        setActiveTool(null);
    };

    const toolsRef = useRef<HTMLDivElement>(null);
    const scrollToTools = () => {
        toolsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen text-white animated-gradient overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-sm">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold neon-text-cyan">Genora</h1>
                    {/* Mobile menu could be added here */}
                </nav>
            </header>

            <main className="container mx-auto px-6 pt-24">
                {/* Hero Section */}
                <section className="h-[80vh] flex flex-col justify-center items-center text-center">
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-4 animate-fade-in-down">
                        Welcome to Genora
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-8 animate-fade-in-up">
                        Instantly generate titles, hashtags, bios, slogans, and more — all powered by intelligent AI.
                    </p>
                    <button
                        onClick={scrollToTools}
                        className="bg-cyan-500 text-black font-bold py-3 px-8 rounded-lg hover:bg-cyan-400 transition-all duration-300 transform hover:shadow-lg hover:shadow-cyan-500/50 btn-animated"
                    >
                        Try Now
                    </button>
                </section>

                {/* Tools Section */}
                <AnimatedSection>
                    <section ref={toolsRef} id="tools" className="py-20">
                        <h3 className="text-3xl font-bold text-center mb-12">Our Creative Toolkit</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {TOOLS.map(tool => (
                                <ToolCard key={tool.id} tool={tool} onClick={() => openToolModal(tool)} />
                            ))}
                        </div>
                    </section>
                </AnimatedSection>
                
                {/* Trust Section */}
                <AnimatedSection>
                   <TrustSection />
                </AnimatedSection>

                {/* Reviews Section */}
                <AnimatedSection>
                    <ReviewsSection onLeaveFeedback={() => setFeedbackModalOpen(true)} />
                </AnimatedSection>
            </main>

            {/* Footer */}
            <footer className="text-center py-8 text-gray-500">
                <p>&copy; {new Date().getFullYear()} Genora. All rights reserved.</p>
            </footer>

            {/* Modals */}
            {activeTool && (
                <ToolModal
                    isOpen={!!activeTool}
                    tool={activeTool}
                    toolState={toolStates[activeTool.id]}
                    onClose={closeToolModal}
                    updateToolState={updateToolState}
                />
            )}
             {isFeedbackModalOpen && <FeedbackModal onClose={() => setFeedbackModalOpen(false)} />}
            
            <ChatBot />
        </div>
    );
}

// --- Sub-components for App ---

const ToolCard: React.FC<{ tool: Tool; onClick: () => void }> = ({ tool, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-[#2B2B2B] p-6 rounded-2xl border border-transparent hover:border-cyan-500/50 cursor-pointer tool-card"
        >
            <div className="flex items-center gap-4 mb-4">
                {tool.icon}
                <h4 className="text-xl font-bold text-white">{tool.name}</h4>
            </div>
            <p className="text-gray-400">{tool.description}</p>
        </div>
    );
};

const TrustSection = () => {
    const { count, ref } = useAnimatedCounter(250000);
    return (
        <section className="py-20 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
                🌍 Trusted by over <span ref={ref} className="text-cyan-400">{count.toLocaleString()}+</span> content creators worldwide!
            </h3>
        </section>
    );
};

const ReviewsSection: React.FC<{ onLeaveFeedback: () => void }> = ({ onLeaveFeedback }) => {
    const [currentReview, setCurrentReview] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentReview(prev => (prev + 1) % REVIEWS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-20">
            <h3 className="text-3xl font-bold text-center mb-12">What Our Users Say</h3>
            <div className="relative max-w-3xl mx-auto h-48 flex items-center justify-center overflow-hidden">
                {REVIEWS.map((review, index) => (
                    <div key={index} className={`absolute w-full transition-opacity duration-500 ease-in-out ${index === currentReview ? 'opacity-100' : 'opacity-0'}`}>
                        <ReviewCard review={review} />
                    </div>
                ))}
            </div>
             <div className="text-center mt-12">
                <button onClick={onLeaveFeedback} className="bg-transparent border border-cyan-500 text-cyan-500 font-bold py-3 px-8 rounded-lg hover:bg-cyan-500 hover:text-black transition-all duration-300 btn-animated">
                    Leave Feedback
                </button>
            </div>
        </section>
    );
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="bg-[#2B2B2B]/50 p-6 rounded-lg text-center">
        <div className="flex justify-center mb-2">
            {[...Array(5)].map((_, i) => (
                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-600'}>⭐</span>
            ))}
        </div>
        <p className="text-lg italic text-gray-300 mb-4">"{review.text}"</p>
        <div className="flex items-center justify-center gap-2">
            <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full" />
            <span className="font-semibold text-white">- {review.name}</span>
        </div>
    </div>
);

const FeedbackModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [submitted, setSubmitted] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-[#1e1e1e] rounded-2xl p-8 w-11/12 max-w-md relative" onClick={e => e.stopPropagation()}>
                {!submitted ? (
                     <>
                        <h3 className="text-2xl font-bold text-white mb-6 text-center neon-text-cyan">Leave Feedback</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Your Name" className="w-full bg-[#2B2B2B] text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500" required />
                            <textarea placeholder="Your feedback..." className="w-full bg-[#2B2B2B] text-white border border-gray-600 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-cyan-500" required></textarea>
                            <button type="submit" className="w-full bg-cyan-500 text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors btn-animated">Submit Feedback</button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-10">
                        <h3 className="text-2xl font-bold text-cyan-400">Thank you!</h3>
                        <p className="text-gray-300 mt-2">Your feedback has been submitted.</p>
                    </div>
                )}
            </div>
        </div>
    );
};