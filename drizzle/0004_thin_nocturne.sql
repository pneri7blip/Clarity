CREATE TABLE `portfolio_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileKey` varchar(120) NOT NULL,
	`totalValue` decimal(18,2) NOT NULL,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	`source` varchar(64) NOT NULL DEFAULT 'manual',
	CONSTRAINT `portfolio_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileKey` varchar(120) NOT NULL,
	`symbol` varchar(32) NOT NULL,
	`side` varchar(16) NOT NULL,
	`quantity` decimal(18,6) NOT NULL,
	`price` decimal(18,6) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'EUR',
	`executedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolio_transactions_id` PRIMARY KEY(`id`)
);
