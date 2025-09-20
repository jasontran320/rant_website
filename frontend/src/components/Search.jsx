import { useEffect, useState, useRef } from 'react';
import styles from "../styles/search.module.css"
import { useNavigate } from "react-router-dom";

export default function Search({ isOpen, onToggle }) {
    const [message, setMessage] = useState("");
    const [message2, setMessage2] = useState("");
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
            setMessage2("");
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
            const response = await fetch(`https://rant-website.onrender.com/api/search?input=${encodeURIComponent(query)}`);
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
        setMessage2(query);
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
                    handleSuggestionClick(suggestions[selectedIndex]._id);
                } else {
                    handleSuggestionClick(message, 'input');
                }
                e.target.blur();
                break;
            case 'Escape':
                setSuggestions([]);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSuggestionClick = (input, type='id') => {
        onToggle()
        navigate(`/post/${type}=${input}`); // You need to find a way to differentiate the different inputs, whether speicifcally pressed a title or entered a random phrase
        setMessage('');
        setMessage2('');
        setOpen(false);
        setSelectedIndex(-1);
        // Navigate to post or perform action
        console.log('Selected post:', input);
        console.log(`Selected index: ${selectedIndex}`)
    };

    const search_function = (e) => {
        e.preventDefault();
        if (message.length > 0) {
            console.log("Searching for:", message);
            console.log(`Selected index: ${selectedIndex}`)
            // Perform full search action
            setSuggestions([]);
            setSelectedIndex(-1);
            handleSuggestionClick(message, 'input');
        }
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

    useEffect(() => {if (selectedIndex == -1) {setMessage(message2)} else {setMessage(suggestions[selectedIndex].title)}}, [selectedIndex])
    

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
                                <div className={styles.suggestions} onMouseLeave={() => setSelectedIndex(-1)}>
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
                                            onClick={() => handleSuggestionClick(post._id)}
                                            onMouseMove={() => {
                                                if (selectedIndex !== index) {
                                                    setSelectedIndex(index);
                                                }
                                                }}

                                        >
                                            <div className={styles.suggestionTitle}>
                                                {highlightMatch(post.title, message2)}
                                            </div>
                                            {post.description && (
                                                <div className={styles.suggestionDescription}>
                                                    {highlightMatch(
                                                        post.description.substring(0, 100) + 
                                                        (post.description.length > 100 ? '...' : ''),
                                                        message2
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    
                                </div>

                            )}

                            {suggestions.length === 0 && !isLoading && message.length >= 2 && (
                                        <div className={styles.noResults}>
                                            No results found
                                        </div>
                                    )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}