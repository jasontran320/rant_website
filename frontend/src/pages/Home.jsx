import { useState, useEffect, useRef } from 'react'
import styles from "../styles/home.module.css"
import Search from '../components/Search';
import { useNavigate } from "react-router-dom";
import DocumentPopup from '../components/RantPopup';

export default function Home() {
  const [message, setMessage] = useState({ posts: [], nextPage: 1, hasNextPage: false });
  const [expandedPost, setExpandedPost] = useState(null);
  const [hasLoaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const postRefs = useRef({});

  const [showDocPopup, setShowDocPopup] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');

  const openDocumentPopup = (docId, title) => {
    setSelectedDocId(docId);
    setSelectedTitle(title);
    setShowDocPopup(true);
  };
  
const handlePostClick = (e, postId) => {
  e.preventDefault();
  setExpandedPost(expandedPost === postId ? null : postId);
  
  // Scroll to the element after state update
  setTimeout(() => {
  if (postRefs.current[postId]) {
    const element = postRefs.current[postId];
    const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const adjustedPosition = offsetTop - (viewportHeight * 0.1); // 20% from top of viewport
    
    window.scrollTo({
      top: Math.max(0, adjustedPosition), // Ensure we don't scroll above the page
      behavior: 'smooth'
    });
  }
}, 75); // Small delay to ensure state has updated
};

  const getPosts = (page = null) => {
    let base_url = "https://rant-website.onrender.com/api/posts";
    if (page !== null) {
      base_url += `?page=${page}`;
    }
    
    return fetch(base_url)
      .then(response => response.json())
      .then(data => {
        setMessage(data);
        setExpandedPost(null);
        console.log("reloading");
        setLoaded(true);
        return data; // Return for chaining
      })
      .catch(error => console.error('Error fetching data:', error));
  };


  useEffect(() => {
    getPosts();
  }, []); 

  useEffect(() => {
    if (hasLoaded) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      return;
    }
    debounceRef.current = setTimeout(() => {
      getPosts();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [hasLoaded]); // Runs when hasLoaded changes


  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <Search/>
        <h1>Story of my Life</h1>
      </div>
      <img src="https://res.cloudinary.com/duzpnun6p/image/upload/v1758057682/home_nn4iyj.jpg" alt="road ahead" className={styles.hero_image} width="981" height="528"/>
      <section className={styles.articles}>
        <h2 className={styles.articles_heading}>Posts</h2>
        
        {hasLoaded ? (<ul className={styles.article_ul}>
          {message.posts.map((post) => {
            return (
              <li 
                key={post._id} 
                ref={(el) => postRefs.current[post._id] = el}
                onClick={(e) => handlePostClick(e, post._id)}
              >
                <a 
                >
                  <span>{post.title}</span>
                  <span>{new Date(post.createdAt).toDateString()}</span>
                </a>
                {expandedPost === post._id && (
                  <div className={styles.post_preview} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.preview_content}>
                      <div className={styles.post_content}> 
                        <div className={styles.post_image}>
                          <img
                            src={post.img_url}
                            className={styles.description_image}
                  
                          />
                          {/* <p className={styles.post_quote}>
                            {post.body2}
                          </p> */}

                        </div>
                        <p>{post.body || "Preview content would appear here. Click 'Read Full Post' to continue reading..."}</p>
                        
                        {/* <iframe 
                          className={styles.description_image}
                          src={`https://drive.google.com/file/d/1USzscsGJ47lrjt5CKPQRt-O_dyroCkeg/preview`}
                        ></iframe> */}
                      </div>
                      <div className={styles.post_content_footer}>
                        <button
                          className={styles.full_post_link}
                          onClick={(e) => {
                            e.preventDefault();
                            openDocumentPopup(post.doc_id, post.title || 'Document');
                          }}
                        >
                          Read Full Post →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>) : 
        <div className={styles.loadingSection}>
          <div className={styles.loadingItem}>
              <span className={styles.loadingSpinner}></span>
              <p className={styles.loadingHeader}>Starting Server, Loading Posts...</p>
          </div>
          <p className={styles.loadingText} onClick={() => {navigate('/about'); window.scrollTo(0, 0);}}>
            &raquo; Consider Reading The About Section
          </p>
        </div>
      }
      </section>
      <div className={styles.pagination_section}>
        {message.hasNextPage &&
        (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              getPosts(message.nextPage);
            }}
            className={`${styles.pagination} ${styles.right}`}
          >
            View Newer Posts &gt;
          </a>
        )}
        {(message.nextPage - 1) > 1 &&
        (
          <a className={`${styles.pagination}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              getPosts(message.nextPage - 2);
            }}
            >&lt; View Older Posts
          </a>
        )
        }
      </div>
      <DocumentPopup 
        docId={selectedDocId}
        isOpen={showDocPopup}
        onClose={() => setShowDocPopup(false)}
        title={selectedTitle}
      />
    </div>
  )
}