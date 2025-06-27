import styles from "../styles/post.module.css"
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';

export default function PDFStyleDocument() {
  const location = useLocation();

  console.log(location.pathname); // <-- "/post" or whatever the path is
  let id = location.pathname.split("/").pop()
  const [doc, setDoc] = useState({ post: {id: null, title: null, body: null}});
  
    useEffect(
      // Fetch data when component mounts
      () => {
        const pathname = location.pathname;

  // split by "/", filter out empty parts, take the last one
        setDoc(pathname.split("/").filter(Boolean).pop());
        setTimeout(() => {
          window.scrollTo({
            top: 50,
            behavior: 'auto' // or 'auto'
          });
          }, 25);

      }
      //make sure to address page management in here
      , []);

  return (
    <div className={styles.main}>
    <iframe className={styles.pdf_document} src={`https://drive.google.com/file/d/${doc}/preview`} allow="autoplay"></iframe>
    </div>
  );
}