CREATE TABLE `investor_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`goal` varchar(120) NOT NULL,
	`horizon` varchar(80) NOT NULL,
	`risk` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investor_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `investor_profiles_openId_unique` UNIQUE(`openId`)
);
