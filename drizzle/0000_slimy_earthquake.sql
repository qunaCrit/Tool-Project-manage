CREATE TABLE `issues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`priority` text DEFAULT 'MEDIUM' NOT NULL,
	`impact` text,
	`owner` text,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`resolution` text,
	`due_date` text,
	`detected_at` text,
	`resolved_at` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "issues_priority_check" CHECK(priority in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
	CONSTRAINT "issues_status_check" CHECK(status in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);
--> statement-breakpoint
CREATE INDEX `issues_project_id_idx` ON `issues` (`project_id`);--> statement-breakpoint
CREATE INDEX `issues_status_idx` ON `issues` (`status`);--> statement-breakpoint
CREATE INDEX `issues_due_date_idx` ON `issues` (`due_date`);--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`meeting_date` integer NOT NULL,
	`participants` text,
	`agenda` text,
	`notes` text,
	`summary` text,
	`decisions` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `meetings_project_id_idx` ON `meetings` (`project_id`);--> statement-breakpoint
CREATE INDEX `meetings_meeting_date_idx` ON `meetings` (`meeting_date`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'PLANNING' NOT NULL,
	`start_date` text,
	`end_date` text,
	`owner` text,
	`customer` text,
	`objective` text,
	`health_note` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "projects_status_check" CHECK(status in ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'))
);
--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE TABLE `risks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`probability` text NOT NULL,
	`impact` text NOT NULL,
	`severity` text NOT NULL,
	`mitigation` text,
	`owner` text,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`due_date` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "risks_probability_check" CHECK(probability in ('LOW', 'MEDIUM', 'HIGH')),
	CONSTRAINT "risks_impact_check" CHECK(impact in ('LOW', 'MEDIUM', 'HIGH')),
	CONSTRAINT "risks_severity_check" CHECK(severity in ('LOW', 'MEDIUM', 'HIGH')),
	CONSTRAINT "risks_status_check" CHECK(status in ('OPEN', 'MONITORING', 'MITIGATED', 'CLOSED'))
);
--> statement-breakpoint
CREATE INDEX `risks_project_id_idx` ON `risks` (`project_id`);--> statement-breakpoint
CREATE INDEX `risks_status_idx` ON `risks` (`status`);--> statement-breakpoint
CREATE INDEX `risks_severity_idx` ON `risks` (`severity`);--> statement-breakpoint
CREATE INDEX `risks_due_date_idx` ON `risks` (`due_date`);--> statement-breakpoint
CREATE TABLE `weekly_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`week_start` text NOT NULL,
	`week_end` text NOT NULL,
	`overall_status` text DEFAULT 'GREEN' NOT NULL,
	`summary` text,
	`completed_work` text,
	`ongoing_work` text,
	`upcoming_work` text,
	`risks` text,
	`issues` text,
	`decisions` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "weekly_reports_overall_status_check" CHECK(overall_status in ('GREEN', 'YELLOW', 'RED'))
);
--> statement-breakpoint
CREATE INDEX `weekly_reports_project_id_idx` ON `weekly_reports` (`project_id`);--> statement-breakpoint
CREATE INDEX `weekly_reports_week_start_idx` ON `weekly_reports` (`week_start`);--> statement-breakpoint
CREATE TABLE `work_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`meeting_id` integer,
	`type` text DEFAULT 'TASK' NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'TODO' NOT NULL,
	`priority` text DEFAULT 'MEDIUM' NOT NULL,
	`owner` text,
	`due_date` text,
	`source` text,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "work_items_type_check" CHECK(type in ('TASK', 'ACTION_ITEM')),
	CONSTRAINT "work_items_status_check" CHECK(status in ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED')),
	CONSTRAINT "work_items_priority_check" CHECK(priority in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);
--> statement-breakpoint
CREATE INDEX `work_items_project_id_idx` ON `work_items` (`project_id`);--> statement-breakpoint
CREATE INDEX `work_items_meeting_id_idx` ON `work_items` (`meeting_id`);--> statement-breakpoint
CREATE INDEX `work_items_status_idx` ON `work_items` (`status`);--> statement-breakpoint
CREATE INDEX `work_items_due_date_idx` ON `work_items` (`due_date`);