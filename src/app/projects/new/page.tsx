import Link from "next/link";

import { T } from "@/i18n";
import { ProjectForm } from "../project-form";
import styles from "../../page.module.css";

export default function NewProjectPage() {
  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}><T k="app.eyebrow" /></p>
          <h1><T k="projects.title" /></h1>
        </div>
        <nav className={styles.nav}>
          <Link className={styles.activeNavItem} href="/projects">
            <T k="nav.projects" />
          </Link>
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
            <p className={styles.eyebrow}><T k="projects.create" /></p>
            <h2><T k="projects.new" /></h2>
          </div>
          <Link className={styles.secondaryButton} href="/projects">
            <T k="common.backToList" />
          </Link>
        </header>
        <ProjectForm />
      </section>
    </main>
  );
}
