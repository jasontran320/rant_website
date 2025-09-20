import styles from "../styles/home.module.css"
import { useState, useEffect, useRef } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import DocumentPopup from '../components/RantPopup';
import { Home } from "lucide-react";


export default function PDFStyleDocument() {
  const { id, input } = useParams(); // get route params
  const location = useLocation();
  const [expandedPost, setExpandedPost] = useState(null);
  const navigate = useNavigate();

  const postRefs = useRef({});
  //console.log(location.pathname); // <-- "/post" or whatever the path is

  const debounceRef = useRef(null);
  const [message, setMessage] = useState({ posts: [], nextPage: 1, hasNextPage: false });
  const [hasLoaded, setLoaded] = useState(false);
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

  const getPosts = async (page = null) => {
  const pathname = location.pathname;
  let parameters = pathname.split("/").filter(Boolean).pop();
  if (parameters === "input=") parameters = parameters.concat("/")

  // build query string properly
  console.log(`The query is ${parameters}`)
  let base_url = `https://rant-website.onrender.com/api/search-paginated?${parameters}`;
  if (page !== null) {
    base_url += `&page=${page}`; // use & not ?
  }

  return fetch(base_url)
    .then(response => response.json())
    .then(data => {
      console.log("Hitted here")
      console.log(data)
      setMessage(data);
      setExpandedPost(null);
      setLoaded(true);
      return data;
    })
    .catch(error => console.error("Error fetching data:", error));
};


useEffect(() => {
    getPosts(input); // or however you fetch
  }, [id, input]); // re-run when these change

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


const getSearchTerm = () => {
  if (message) {
    if (message.posts.length > 0) {
      return message.searchTerm ? message.searchTerm : (message.posts[0].title.length > 20
      ? message.posts[0].title.slice(0, 20) + "…"
      : message.posts[0].title)
    }
    else {
      return message.searchTerm ? message.searchTerm : "Error in Server"
    }
  }
    return "n/a";
}

  
  return (
    <div className={styles.main}>
      












      <section className={styles.articles}>
              <h2 className={styles.articles_heading}>Results for '{id === "input" ? "Hello" : getSearchTerm()}'</h2>
              
              {hasLoaded ? (<ul className={styles.article_ul}>
                {message.posts.length == 0 && (
                  <div className={styles.empty_container}>
                    <div className={styles.empty_card}>
                      <div className={styles.empty_icon}>🔍</div>
                      <h3 className={styles.empty_title}>No results found</h3>
                      <p className={styles.empty_message}>
                        We couldn't find anything matching your search. 
                        Try different keywords or browse our home page.
                      </p>
                    </div>
                  </div>
                )
                }
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
                  className={`${styles.pagination}`}
                >
                  &lt; View Older Posts
                </a>
              )}
              {(message.nextPage - 1) > 1 &&
              (
                <a className={`${styles.pagination}  ${styles.right}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    getPosts(message.nextPage - 2);
                  }}
                  >View Newer Posts &gt;
                </a>
              )
              }
              <button className={styles.home_button} onClick={() => {navigate('/'); window.scrollTo(0, 0);}}><Home className={styles.home_icon} /> Home</button>
            </div>
            <DocumentPopup 
                    docId={selectedDocId}
                    isOpen={showDocPopup}
                    onClose={() => setShowDocPopup(false)}
                    title={selectedTitle}
            />
    </div>
  );
}



