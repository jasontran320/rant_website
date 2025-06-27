import { useEffect, useState, useRef } from 'react';
import styles from "../styles/search.module.css"
import { useNavigate } from "react-router-dom";

export default function Search({ isOpen, onToggle }) {
    const [message, setMessage] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [openSuggestions, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [cache, setCache] = useState(new Map()); // In-memory cache
    const navigate = useNavigate();
    const debounceRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            // Focus input when search opens
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = "";
            // Clear suggestions when closing
            setSuggestions([]);
            setSelectedIndex(-1);
            setMessage("");
        }
   
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Function to highlight matching text
    const highlightMatch = (text, query) => {
        if (!query || !text) return text;
        
        // Escape special regex characters
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => {
            if (regex.test(part)) {
                return <mark key={index} className={styles.highlight}>{part}</mark>;
            }
            return part;
        });
    };

    const fetchSuggestions = async (query) => {
        // Check cache first
        if (cache.has(query)) {
            setSuggestions(cache.get(query));
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/search?input=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            // Cache the results
            const newCache = new Map(cache);
            newCache.set(query, data.posts);
            setCache(newCache);
            
            setSuggestions(data.posts);
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const query = e.target.value;
        setMessage(query);
        setSelectedIndex(-1);

        // Clear existing debounce timer
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Clear suggestions if query is too short
        if (query.length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        // Set loading state
        setIsLoading(true);
        setSuggestions([]);

        // Debounce the API call (300ms delay)
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(query);
        }, 250);
    };

    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else {
                    search_function(e);
                }
                e.target.blur();
                break;
            case 'Escape':
                setSuggestions([]);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSuggestionClick = (post) => {
        onToggle()
        navigate(`/post/${post.doc_id}`);
        setMessage(post.title);
        setOpen(false);
        setSelectedIndex(-1);
        // Navigate to post or perform action
        console.log('Selected post:', post);
    };

    const search_function = (e) => {
        e.preventDefault();
        console.log("Searching for:", message);
        // Perform full search action
        setSuggestions([]);
        setSelectedIndex(-1);
    };

    // Clear cache when it gets too large (optional)
    useEffect(() => {
        if (cache.size > 50) {
            const newCache = new Map();
            // Keep only the 25 most recent entries
            const entries = Array.from(cache.entries()).slice(-25);
            entries.forEach(([key, value]) => newCache.set(key, value));
            setCache(newCache);
        }
    }, [cache.size]);
    

    const useClickOutside = (ref, handler) => {
        useEffect(() => {
            const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
            };

            document.addEventListener("mousedown", listener);
            return () => {
            document.removeEventListener("mousedown", listener);
            };
        }, [ref, handler]);
    }

    const containerRef = useRef();
    useClickOutside(containerRef, () => setOpen(false));



    return (
        <div
            className={`${styles.searchBar} ${isOpen ? styles.open : ''}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onToggle();
                }
            }}
        >
            <div className={styles.container}>
                <form onSubmit={search_function} className={styles.search_form}>
                    <div className={styles.searchInputContainer}>
                        <div ref={containerRef}>
                            <input
                                ref={inputRef}
                                type="search"
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                aria-label="Search"
                                id="searchInput"
                                name="searchTerm"
                                // onBlur={() => {
                                //     want to close only if <div className={styles.suggestions}> not clicked
                                //     setOpen(false)
                                // }}
                                onFocus={(e) => {e.target.value = message; handleInputChange(e); setOpen(true)}}
                                value={message}
                                placeholder="Search the site..."
                                autoComplete="off"
                            />
                            
                            {/* Suggestions Dropdown */}
                            {(suggestions.length > 0 || isLoading) && openSuggestions && (
                                <div className={styles.suggestions}>
                                    {isLoading && (
                                        <div className={styles.loadingItem}>
                                            <span className={styles.loadingSpinner}></span>
                                            Searching...
                                        </div>
                                    )}
                                    
                                    {suggestions.map((post, index) => (
                                        <div
                                            key={post._id}
                                            className={`${styles.suggestionItem} ${
                                                selectedIndex === index ? styles.selected : ''
                                            }`}
                                            onClick={() => handleSuggestionClick(post)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                        >
                                            <div className={styles.suggestionTitle}>
                                                {highlightMatch(post.title, message)}
                                            </div>
                                            {post.description && (
                                                <div className={styles.suggestionDescription}>
                                                    {highlightMatch(
                                                        post.description.substring(0, 100) + 
                                                        (post.description.length > 100 ? '...' : ''),
                                                        message
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {suggestions.length === 0 && !isLoading && message.length >= 2 && (
                                        <div className={styles.noResults}>
                                            No results found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}