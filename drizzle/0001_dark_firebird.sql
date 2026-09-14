CREATE TABLE `daily_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`report_date` text NOT NULL,
	`project_name` text,
	`workstream` text,
	`task_id` text,
	`task` text NOT NULL,
	`owner` text,
	`plan_today` text,
	`actual_result` text,
	`complete_percent` integer,
	`status` text DEFAULT 'TODO' NOT NULL,
	`priority` text DEFAULT 'MEDIUM' NOT NULL,
	`blocker_issue` text,
	`risk` text,
	`support_needed` text,
	`next_action` text,
	`due_date` text,
	`health` text DEFAULT 'GREEN' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "daily_reports_status_check" CHECK(status in ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED')),
	CONSTRAINT "daily_reports_priority_check" CHECK(priority in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
	CONSTRAINT "daily_reports_health_check" CHECK(health in ('GREEN', 'YELLOW', 'RED'))
);
--> statement-breakpoint
CREATE INDEX `daily_reports_project_id_idx` ON `daily_reports` (`project_id`);--> statement-breakpoint
CREATE INDEX `daily_reports_report_date_idx` ON `daily_reports` (`report_date`);--> statement-breakpoint
CREATE INDEX `daily_reports_status_idx` ON `daily_reports` (`status`);--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `week` text;--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `project_name` text;--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `progress_percent` integer;--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `key_achievements` text;--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `planned_not_done` text;--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `issues_blockers` text;--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `decisions_needed` text;--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `next_week_plan` text;--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `owner` text;--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `due_target` text;--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `management_note` text;--> statement-breakpoint
ALTER TABLE `weekly_reports` ADD `trend` text;--> statement-breakpoint
UPDATE `weekly_reports`
SET
	`week` = `week_start` || ' - ' || `week_end`,
	`project_name` = (
		SELECT `projects`.`name`
		FROM `projects`
		WHERE `projects`.`id` = `weekly_reports`.`project_id`
	),
	`key_achievements` = `completed_work`,
	`planned_not_done` = `ongoing_work`,
	`issues_blockers` = `issues`,
	`decisions_needed` = `decisions`,
	`next_week_plan` = `upcoming_work`,
	`management_note` = `notes`,
	`trend` = 'STABLE';
