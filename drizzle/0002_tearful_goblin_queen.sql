CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileKey` varchar(120) NOT NULL,
	`symbol` varchar(32) NOT NULL,
	`kind` varchar(32) NOT NULL,
	`threshold` decimal(18,6) NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileKey` varchar(120) NOT NULL,
	`symbol` varchar(32) NOT NULL,
	`quantity` decimal(18,6) NOT NULL,
	`averagePrice` decimal(18,6) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'EUR',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolio_positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `investor_profiles` DROP INDEX `investor_profiles_openId_unique`;--> statement-breakpoint
ALTER TABLE `investor_profiles` ADD `profileKey` varchar(120) NOT NULL;--> statement-breakpoint
ALTER TABLE `investor_profiles` ADD `name` varchar(120) NOT NULL;--> statement-breakpoint
ALTER TABLE `investor_profiles` ADD CONSTRAINT `investor_profiles_profileKey_unique` UNIQUE(`profileKey`);