import Link from "next/link";

import { T } from "@/i18n";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}><T k="app.eyebrow" /></p>
          <h1><T k="app.name" /></h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects"><T k="nav.projects" /></Link>
          <span><T k="nav.overview" /></span>
          <span><T k="nav.workItems" /></span>
          <span><T k="nav.meetings" /></span>
          <span><T k="nav.risks" /></span>
          <span><T k="nav.issues" /></span>
          <span><T k="nav.weeklyReports" /></span>
        </nav>
      </aside>
      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}><T k="app.foundation" /></p>
            <h2><T k="app.description" /></h2>
          </div>
          <Link className={styles.primaryButton} href="/projects">
            <T k="projects.open" />
          </Link>
        </header>
        <div className={styles.emptyState}>
          <h3><T k="projects.startTitle" /></h3>
          <p>
            <T k="projects.startBody" />
          </p>
        </div>
      </section>
    </main>
  );
}
