CREATE TABLE `alert_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileKey` varchar(120) NOT NULL,
	`alertId` int NOT NULL,
	`symbol` varchar(32) NOT NULL,
	`message` varchar(255) NOT NULL,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`acknowledged` int NOT NULL DEFAULT 0,
	CONSTRAINT `alert_events_id` PRIMARY KEY(`id`)
);
