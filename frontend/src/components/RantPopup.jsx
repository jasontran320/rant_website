import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from '../styles/documentPopup.module.css';

export default function DocumentPopup({ docId, isOpen, onClose, title = "Document" }) {
  useEffect(() => {
    // Handle ESC key to close popup
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div>
      {/* Backdrop */}
      <div 
        className={styles.backdrop}
      />
      
      {/* Popup Container */}
      <div className={styles.popupContainer}
        onClick={() => {onClose()}}>
        <div className={styles.popup}>
          
        {/* Document Container */}
        <div className={styles.documentWrapper}>
            <iframe
            src={`https://drive.google.com/file/d/${docId}/preview?rm=minimal&embedded=true`}
            allow="autoplay"
            className={styles.document}
            title={title}
            />
        </div>
        </div>
      </div>
    </div>
  );
}