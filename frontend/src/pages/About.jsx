import styles from "../styles/about.module.css";

export default function About() {
  return (
    <div className={styles.about_container}>
      <h1 className={styles.about_title}>Preface</h1>
      <img src="image5.png" alt="road ahead" className={styles.hero_image} width="981" height="528"/>
      <p className={styles.about_paragraph}>
        For the span of 2–3 years, I've been documenting my changes in beliefs, thoughts, and perspectives in response to everyday moments and moods. A rant is a snapshot of the person I was when I wrote it. This website is a time capsule to preserve and share all of those rants.
      </p>
    </div>
  );
}
