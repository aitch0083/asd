CREATE TABLE IF NOT EXISTS `users` (
	`id`        SERIAL,
	`name`     VARCHAR(35) NOT NULL,
	`email`    VARCHAR(40) NOT NULL,
	`password` VARCHAR(40) NOT NULL,
	`about_me` VARCHAR(255) DEFAULT "",
	`type`     ENUM('usual','admin') NOT NULL DEFAULT "usual",
	`sex`      ENUM('male','female','unknown') NOT NULL DEFAULT "unknown",
	`created`  DATETIME,
	`modified` DATETIME,
	INDEX(`email`, `password`),
	INDEX(`type`),
	INDEX(`name`, `email`, `password`)
)ENGINE=MyISAM CHARSET utf8; 