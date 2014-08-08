# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: lbs.cwjfeqo83snq.us-east-1.rds.amazonaws.com (MySQL 5.6.13-log)
# Database: lbs
# Generation Time: 2014-06-12 19:09:25 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table geolocation_api_track
# ------------------------------------------------------------

DROP TABLE IF EXISTS `geolocation_api_track`;

CREATE TABLE `geolocation_api_track` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `api_key` varchar(255) NOT NULL DEFAULT '',
  `insert_count` int(11) NOT NULL,
  `timestamp` int(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table geolocation_cities
# ------------------------------------------------------------

DROP TABLE IF EXISTS `geolocation_cities`;

CREATE TABLE `geolocation_cities` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `country` varchar(255) CHARACTER SET latin1 NOT NULL DEFAULT '',
  `state_region` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `city` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `postal_code` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `lat` float NOT NULL,
  `lng` float NOT NULL,
  `dma_code` varchar(255) DEFAULT NULL,
  `area_code` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Dump of table geolocation_dma
# ------------------------------------------------------------

DROP TABLE IF EXISTS `geolocation_dma`;

CREATE TABLE `geolocation_dma` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `dma_code` varchar(100) NOT NULL DEFAULT '',
  `region_name` varchar(100) NOT NULL DEFAULT '',
  `lng` float NOT NULL,
  `lat` float NOT NULL,
  `adperc` varchar(100) NOT NULL,
  `tvperc` varchar(100) NOT NULL DEFAULT '',
  `cableperc` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `dma_code` (`dma_code`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table geolocation_ip_locations
# ------------------------------------------------------------

DROP TABLE IF EXISTS `geolocation_ip_locations`;

CREATE TABLE `geolocation_ip_locations` (
  `id` int(30) unsigned NOT NULL AUTO_INCREMENT,
  `start_ip_num` int(30) NOT NULL,
  `end_ip_num` int(30) NOT NULL,
  `loc_id` int(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table geolocation_postal_codes
# ------------------------------------------------------------

DROP TABLE IF EXISTS `geolocation_postal_codes`;

CREATE TABLE `geolocation_postal_codes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `postal_code` varchar(20) DEFAULT NULL,
  `lat` varchar(255) DEFAULT NULL,
  `lng` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state_region` varchar(255) DEFAULT NULL,
  `county` varchar(255) DEFAULT NULL,
  `country` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table geolocation_weather_cache
# ------------------------------------------------------------

DROP TABLE IF EXISTS `geolocation_weather_cache`;

CREATE TABLE `geolocation_weather_cache` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` int(20) NOT NULL,
  `postal_code` varchar(255) NOT NULL DEFAULT '',
  `city` varchar(255) NOT NULL DEFAULT '',
  `state_region` varchar(255) NOT NULL DEFAULT '',
  `lat` varchar(255) NOT NULL DEFAULT '',
  `lng` varchar(255) NOT NULL DEFAULT '',
  `nws_xml` text NOT NULL,
  `nws_page` varchar(255) NOT NULL DEFAULT '',
  `forecast_length` varchar(255) NOT NULL DEFAULT '',
  `data` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
