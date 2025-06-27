import styles from "../styles/footer.module.css"

export default function Footer () {
    return (
        <footer className={styles.footer}>
            &copy; {new Date().getFullYear()} Jason &#x2022; Built with node.js, react, and mongodb
        </footer>
    )
}