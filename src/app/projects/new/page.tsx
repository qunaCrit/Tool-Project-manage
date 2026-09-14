import Link from "next/link";

import { ProjectForm } from "../project-form";
import styles from "../../page.module.css";

export default function NewProjectPage() {
  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>Local PM Assistant</p>
          <h1>Projects</h1>
        </div>
        <nav className={styles.nav}>
          <Link className={styles.activeNavItem} href="/projects">
            Projects
          </Link>
          <span>Project Overview</span>
          <span>Work Items</span>
          <span>Meetings</span>
          <span>Risks</span>
          <span>Issues</span>
          <span>Weekly Reports</span>
        </nav>
      </aside>
      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Create Project</p>
            <h2>New project</h2>
          </div>
          <Link className={styles.secondaryButton} href="/projects">
            Back to list
          </Link>
        </header>
        <ProjectForm />
      </section>
    </main>
  );
}
