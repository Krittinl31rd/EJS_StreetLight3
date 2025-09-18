CREATE DATABASE  IF NOT EXISTS `iotserver` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `iotserver`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: iotserver
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `MemberID` int NOT NULL,
  `DeviceID` int NOT NULL,
  `DeviceStyleID` int NOT NULL,
  `DeviceName` varchar(32) NOT NULL,
  `Lat` varchar(45) DEFAULT NULL,
  `Long` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`MemberID`,`DeviceID`),
  KEY `style_device_fk_idx` (`DeviceStyleID`),
  CONSTRAINT `member_device_fk` FOREIGN KEY (`MemberID`) REFERENCES `member` (`MemberID`),
  CONSTRAINT `style_device_fk` FOREIGN KEY (`DeviceStyleID`) REFERENCES `devicestyle` (`DeviceStyleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devicestyle`
--

DROP TABLE IF EXISTS `devicestyle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devicestyle` (
  `DeviceStyleID` int NOT NULL,
  `Name` varchar(50) NOT NULL,
  PRIMARY KEY (`DeviceStyleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devicestyle`
--

LOCK TABLES `devicestyle` WRITE;
/*!40000 ALTER TABLE `devicestyle` DISABLE KEYS */;
/*!40000 ALTER TABLE `devicestyle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devicetcontrol`
--

DROP TABLE IF EXISTS `devicetcontrol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devicetcontrol` (
  `MemberID` int NOT NULL,
  `DeviceID` int NOT NULL,
  `ControlID` int NOT NULL,
  `ConTypeID` varchar(45) NOT NULL,
  `Label` varchar(45) DEFAULT NULL,
  `LastValue` varchar(45) NOT NULL,
  `Created` varchar(45) NOT NULL,
  PRIMARY KEY (`MemberID`,`ControlID`,`DeviceID`),
  KEY `member_device_control_f_idx` (`MemberID`,`DeviceID`),
  KEY `mem_memdev_control_fk_idx` (`MemberID`,`DeviceID`),
  CONSTRAINT `memdev_fk` FOREIGN KEY (`MemberID`, `DeviceID`) REFERENCES `devices` (`MemberID`, `DeviceID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devicetcontrol`
--

LOCK TABLES `devicetcontrol` WRITE;
/*!40000 ALTER TABLE `devicetcontrol` DISABLE KEYS */;
/*!40000 ALTER TABLE `devicetcontrol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friendright`
--

DROP TABLE IF EXISTS `friendright`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friendright` (
  `FRID` int NOT NULL,
  `Name` varchar(15) NOT NULL,
  `Description` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`FRID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friendright`
--

LOCK TABLES `friendright` WRITE;
/*!40000 ALTER TABLE `friendright` DISABLE KEYS */;
INSERT INTO `friendright` VALUES (1,'Admin','Full access (Owner)'),(2,'Control','Just Control'),(3,'Monitor','Just Monitor');
/*!40000 ALTER TABLE `friendright` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friends`
--

DROP TABLE IF EXISTS `friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friends` (
  `MemberID` int NOT NULL,
  `Friend` int NOT NULL,
  `FRID` int NOT NULL,
  `Created` datetime NOT NULL,
  `FriendStart` datetime NOT NULL,
  `FriendExpire` datetime DEFAULT NULL,
  PRIMARY KEY (`MemberID`,`Friend`),
  KEY `mem_friend_fk_idx` (`Friend`),
  KEY `FRID_fk_idx` (`FRID`),
  CONSTRAINT `FRID_fk` FOREIGN KEY (`FRID`) REFERENCES `friendright` (`FRID`),
  CONSTRAINT `mem_fk` FOREIGN KEY (`MemberID`) REFERENCES `member` (`MemberID`),
  CONSTRAINT `mem_friend_fk` FOREIGN KEY (`Friend`) REFERENCES `member` (`MemberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
INSERT INTO `friends` VALUES (1,2,1,'2025-02-11 15:16:52','2025-02-11 15:16:52',NULL);
/*!40000 ALTER TABLE `friends` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gateway`
--

DROP TABLE IF EXISTS `gateway`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gateway` (
  `GatewayID` int NOT NULL,
  `Name` varchar(50) NOT NULL,
  `lat` varchar(45) DEFAULT NULL,
  `long` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`GatewayID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gateway`
--

LOCK TABLES `gateway` WRITE;
/*!40000 ALTER TABLE `gateway` DISABLE KEYS */;
/*!40000 ALTER TABLE `gateway` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member` (
  `MemberID` int NOT NULL AUTO_INCREMENT,
  `DeviceType` int NOT NULL,
  `Username` varchar(45) NOT NULL,
  `Password` varchar(45) NOT NULL,
  `MemberName` varchar(150) NOT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `MobilePhone` varchar(45) DEFAULT NULL,
  `Img` longtext,
  `Created` datetime NOT NULL,
  `Description` longtext,
  `State` int DEFAULT NULL,
  PRIMARY KEY (`MemberID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member`
--

LOCK TABLES `member` WRITE;
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
INSERT INTO `member` VALUES (1,1,'admin','123456','Administrator','admin@admin.com','+66911111111',NULL,'2025-02-11 15:13:36',NULL,1),(2,1,'ham','123456','Nottingham Smith Ally','ham@ham.com','+66922222222',NULL,'2025-02-11 15:14:39',NULL,1);
/*!40000 ALTER TABLE `member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membertokenlogin`
--

DROP TABLE IF EXISTS `membertokenlogin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membertokenlogin` (
  `MemberID` int NOT NULL,
  `Token` varchar(200) NOT NULL,
  `Start` datetime NOT NULL,
  `Expire` datetime DEFAULT NULL,
  `Created` datetime NOT NULL,
  PRIMARY KEY (`MemberID`),
  CONSTRAINT `member_token` FOREIGN KEY (`MemberID`) REFERENCES `member` (`MemberID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membertokenlogin`
--

LOCK TABLES `membertokenlogin` WRITE;
/*!40000 ALTER TABLE `membertokenlogin` DISABLE KEYS */;
/*!40000 ALTER TABLE `membertokenlogin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `onesignal`
--

DROP TABLE IF EXISTS `onesignal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `onesignal` (
  `MemberID` int NOT NULL,
  `PlayerID` varchar(255) NOT NULL,
  `DevicesID` varchar(255) NOT NULL,
  `Platform` int DEFAULT NULL,
  `Enable` int DEFAULT NULL,
  PRIMARY KEY (`MemberID`),
  CONSTRAINT `member_onesignal` FOREIGN KEY (`MemberID`) REFERENCES `member` (`MemberID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `onesignal`
--

LOCK TABLES `onesignal` WRITE;
/*!40000 ALTER TABLE `onesignal` DISABLE KEYS */;
/*!40000 ALTER TABLE `onesignal` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-11 15:28:53
