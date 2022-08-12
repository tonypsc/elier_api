-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.6-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table elier.chat_message
CREATE TABLE IF NOT EXISTS `chat_message` (
  `message_id` varchar(32) NOT NULL,
  `sender_id` varchar(32) NOT NULL,
  `receiver_id` varchar(32) NOT NULL,
  `message` text DEFAULT NULL,
  `created_on` bigint(13) DEFAULT NULL,
  `read` tinyint(1) DEFAULT 0,
  `deleted` tinyint(1) DEFAULT 0 COMMENT '0- not deleted, \r\n        1- deleted by sender \r\n        2- deleted by receiver\r\n        3- delete by both',
  PRIMARY KEY (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

-- Dumping data for table elier.chat_message: ~0 rows (approximately)
/*!40000 ALTER TABLE `chat_message` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_message` ENABLE KEYS */;

-- Dumping structure for table elier.comment
CREATE TABLE IF NOT EXISTS `comment` (
  `comment_id` varchar(32) NOT NULL,
  `created_on` bigint(13) DEFAULT NULL,
  `comment` text NOT NULL,
  `app` varchar(20) DEFAULT NULL COMMENT 'sing, kipu, poetry, home',
  PRIMARY KEY (`comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

-- Dumping data for table elier.comment: ~0 rows (approximately)
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;

-- Dumping structure for table elier.notification
CREATE TABLE IF NOT EXISTS `notification` (
  `notification_id` varchar(32) NOT NULL,
  `notification` varchar(255) NOT NULL,
  `user_id` varchar(32) NOT NULL,
  `type` tinyint(2) DEFAULT NULL,
  `read` tinyint(1) DEFAULT 0,
  `url` varchar(255) DEFAULT NULL COMMENT 'notification resolve link',
  `created_on` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

-- Dumping data for table elier.notification: ~0 rows (approximately)
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;

-- Dumping structure for table elier.rol
CREATE TABLE IF NOT EXISTS `rol` (
  `rol_id` varchar(32) NOT NULL,
  `name` varchar(80) NOT NULL,
  `status` tinyint(4) DEFAULT 1 COMMENT '1-active, 0-inactive',
  PRIMARY KEY (`rol_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

-- Dumping data for table elier.rol: ~2 rows (approximately)
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` (`rol_id`, `name`, `status`) VALUES
	('admin', 'administrator', 1),
	('user', 'user', 1);
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;

-- Dumping structure for table elier.user
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` varchar(32) NOT NULL,
  `username` varchar(40) NOT NULL,
  `fullname` varchar(80) NOT NULL,
  `pass` varchar(64) NOT NULL,
  `email` varchar(255) NOT NULL,
  `photo` varchar(80) DEFAULT NULL,
  `status` tinyint(4) DEFAULT 1 COMMENT '1-active, 2-baned, 0-inactive',
  `created_on` bigint(13) DEFAULT NULL,
  `recover_link` varchar(255) DEFAULT NULL,
  `link_created_on` bigint(13) NOT NULL DEFAULT 0,
  `rol_id` varchar(32) NOT NULL,
  `theme` varchar(20) DEFAULT NULL COMMENT 'dark, light, etc',
  `last_login` bigint(20) DEFAULT NULL,
  `logged_in` tinyint(1) DEFAULT 0,
  `language` char(2) DEFAULT 'EN',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UNIQUE_NAME` (`username`),
  UNIQUE KEY `UNIQUE_EMAIL` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

-- Dumping data for table elier.user: ~6 rows (approximately)
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` (`user_id`, `username`, `fullname`, `pass`, `email`, `photo`, `status`, `created_on`, `recover_link`, `link_created_on`, `rol_id`, `theme`, `last_login`, `logged_in`, `language`) VALUES
	('adfasdf', 'tony', 'tony', '3333', 'adfa', NULL, 1, NULL, NULL, 0, '', NULL, NULL, 0, 'EN'),
	('ksyp48ym202ec1a8bbc62a5979d44b2c', 'wed', 'con foto', '$2b$10$UJ7St/b4Z2X4aBCJ8cu.peSfv.PYO2Gxi4kKuLpyRc7ZUOjDEAiq6', 'deref21@ddd.com', 'yo21.jpg', 1, NULL, NULL, 0, 'admin', NULL, NULL, 0, 'EN'),
	('ksypvhgb008d4792fbe0d70112c46e63', 'pepe224', 'ttt', '$2b$10$8l9PQeW5kOvMP27A8lLaluWgDMbA.s0sS9eREvWZxG9edGc7Dg0zO', 'dere12d@ddd.com', NULL, 1, NULL, NULL, 0, 'admin', NULL, NULL, 0, 'EN'),
	('ksypztm6fe1fac93f2aecf371a83666b', 'pepe-photo', 'con foto', '$2b$10$gHJDWiAyIcdv5/dVZjdzWu27wTa4UYDuVCJxp6rfLJoEQjcYbTqDe', 'deref@ddd.com', 'yo.jpg', 1, NULL, NULL, 0, 'admin', NULL, NULL, 0, 'EN'),
	('ksyqwa2u20515db244701fef3cdc0933', 'pepe-photo1', 'con foto', '$2b$10$97SYOSGBMUglt4Yf3sk81.rjVI/nROe06jtJjHSjCbfeFniuYZfum', 'deref1@ddd.com', 'yo1.jpg', 1, 1630334213382, NULL, 0, 'admin', NULL, NULL, 0, 'EN'),
	('kt01r4fv453a0f55c43c472534be9f8f', 'rewww', 'wewewe', '$2b$10$qjL3mcwjTggCTxIY11nwpOidd0hTNFBAVa7vsRt8v2E4t5Zipv5oK', 'deref1r@ddd.com', 'yo11.jpg', 1, 1630412914747, 'd8f82e1348272132755666077319cbd41140beb238b6449d5e3e2164d9349587', 1630419274837, 'admin', NULL, NULL, 0, 'EN');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
