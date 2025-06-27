import styles from "../styles/header.module.css"
import Search from "./Search";
import { useState } from "react";

export default function Header () {
    const [search_open, openSearch] = useState(false);

    const toggleSearch = () => {
        openSearch(!search_open);
    }

    return (
    <>
        <header className={styles.header}>
            <a href="/" className={styles.header_logo}>Rants</a>
            <nav className={styles.header_nav}>
                <ul>
                    <li>
                        <a href="/">Home</a>
                    </li>
                    <li>
                        <a href="/about">About</a>
                    </li>
                    {/* <li>
                        <a href="/contact">Contact</a>
                    </li> */}
                </ul>
            </nav>
            <div className={styles.header_button}>
                <button 
                    className={styles.searchBtn} 
                    onClick={toggleSearch}
                >
                    Search ⌕
                </button>
            </div>
        </header>
        <Search 
            isOpen={search_open} 
            onToggle={toggleSearch} 
        />
    </>
    );
}