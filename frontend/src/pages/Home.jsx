import { useState, useEffect } from 'react'
import styles from "../styles/home.module.css"
import Search from '../components/Search';
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [message, setMessage] = useState({ posts: [], nextPage: 1, hasNextPage: false });
  const [expandedPost, setExpandedPost] = useState(null);
  const navigate = useNavigate();
  const getPosts = (page = null) => {
    let base_url = "http://localhost:5000/api/posts";
    if (page !== null) {
        base_url += `?page=${page}`;
    }
    fetch(base_url)
      .then(response => response.json())
      .then(data => setMessage(data))
      .catch(error => console.error('Error fetching data:', error));
  };

  const handlePostClick = (e, postId) => {
    e.preventDefault();
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  useEffect(
    // Fetch data when component mounts
    () => {getPosts()}
    //make sure to address page management in here
    , []);
 
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <Search/>
        <h1>Story of my Life</h1>
      </div>
      <img src="../tumblr_ede45fb063fbe8e5fe2b937ec0cc96d4_4502dc04_1280.jpg" alt="road ahead" className={styles.hero_image} width="981" height="528"/>
      <section className={styles.articles}>
        <h2 className={styles.articles_heading}>Latest Posts</h2>
        <ul className={styles.article_ul}>
          {message.posts.map((post) => {
            return (
              <li key={post._id} onClick={(e) => handlePostClick(e, post._id)}>
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
                            src="rant2.png"
                            alt="road ahead"
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
                          onClick={(e) => navigate(`/post/${post.doc_id}`)}
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
        </ul>
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
      </div>
    </div>
  )
}