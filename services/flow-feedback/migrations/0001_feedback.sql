CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`message` text NOT NULL,
	`category` text DEFAULT 'generale' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`nonce` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_created_at` ON `feedback` (`created_at`);--> statement-breakpoint
CREATE INDEX `feedback_status_created` ON `feedback` (`status`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_nonce` ON `feedback` (`nonce`);--> statement-breakpoint
CREATE TABLE `feedback_rate_limits` (
	`key` text NOT NULL,
	`bucket` integer NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`key`, `bucket`)
);
