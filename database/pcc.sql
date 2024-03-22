CREATE TABLE `admin` (
  `Admin_ID` int NOT NULL AUTO_INCREMENT,
  `Admin_Password` varchar(45) NOT NULL,
  `Admin_Name` varchar(55) NOT NULL,
  PRIMARY KEY (`Admin_ID`),
  UNIQUE KEY `Admin_ID_UNIQUE` (`Admin_ID`),
  UNIQUE KEY `Admin_Password_UNIQUE` (`Admin_Password`),
  UNIQUE KEY `Admin_Name_UNIQUE` (`Admin_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `panchayat` (
  `Panchayat_ID` int NOT NULL AUTO_INCREMENT,
  `Panchayat_Name` varchar(45) NOT NULL,
  `Panchayat_Loc` longtext NOT NULL,
  `PDO_Name` varchar(60) NOT NULL,
  `P_email` varchar(100) NOT NULL,
  `P_password` varchar(255) NOT NULL,
  `Contact_No` int NOT NULL,
  PRIMARY KEY (`Panchayat_ID`),
  UNIQUE KEY `Panchayat_ID_UNIQUE` (`Panchayat_ID`),
  UNIQUE KEY `Panchayat_Name_UNIQUE` (`Panchayat_Name`),
  UNIQUE KEY `PDO_Name_UNIQUE` (`PDO_Name`),
  UNIQUE KEY `Contact_No_UNIQUE` (`Contact_No`),
  UNIQUE KEY `P_email_UNIQUE` (`P_email`),
  UNIQUE KEY `P_password_UNIQUE` (`P_password`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `operator` (
  `Pump_Operator_ID` int NOT NULL AUTO_INCREMENT,
  `Pump_Operator_Name` varchar(50) NOT NULL,
  `Contact_No` int NOT NULL,
  `PO_email` varchar(45) NOT NULL,
  `PO_password` varchar(255) NOT NULL,
  `No_Of_Lines` int DEFAULT NULL,
  PRIMARY KEY (`Pump_Operator_ID`),
  UNIQUE KEY `Pump_Operator_ID_UNIQUE` (`Pump_Operator_ID`),
  UNIQUE KEY `Pump_Operator_Name_UNIQUE` (`Pump_Operator_Name`),
  UNIQUE KEY `Contact_No_UNIQUE` (`Contact_No`),
  UNIQUE KEY `PO_email_UNIQUE` (`PO_email`),
  UNIQUE KEY `PO_password_UNIQUE` (`PO_password`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `sector` (
  `Sector_ID` int NOT NULL AUTO_INCREMENT,
  `Sector_Name` varchar(45) NOT NULL,
  `Panchayat_ID` int NOT NULL,
  `Pump_Operator_ID` int DEFAULT NULL,
  `No_Of_Tanks` int NOT NULL,
  PRIMARY KEY (`Sector_ID`),
  UNIQUE KEY `Sector_ID_UNIQUE` (`Sector_ID`),
  UNIQUE KEY `Sector_Name_UNIQUE` (`Sector_Name`),
  UNIQUE KEY `Pump_Operator_ID_UNIQUE` (`Pump_Operator_ID`),
  KEY `Panchayat_ID_idx` (`Panchayat_ID`),
  KEY `Pump_Operator_ID_idx` (`Pump_Operator_ID`),
  CONSTRAINT `Panchayat_ID` FOREIGN KEY (`Panchayat_ID`) REFERENCES `panchayat` (`Panchayat_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Pump_Operator_ID` FOREIGN KEY (`Pump_Operator_ID`) REFERENCES `operator` (`Pump_Operator_ID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `pumps` (
  `Pump_ID` int NOT NULL AUTO_INCREMENT,
  `Pump_Model` varchar(45) NOT NULL,
  `Pump_Location` varchar(45) NOT NULL,
  `Pump_Operator_ID` int NOT NULL,
  `Pump_Status` varchar(10) NOT NULL,
  `Last_Service` date NOT NULL,
  `Next_Service` date NOT NULL,
  PRIMARY KEY (`Pump_ID`),
  UNIQUE KEY `Pump_ID_UNIQUE` (`Pump_ID`),
  KEY `Pump_Operator_ID_idx` (`Pump_Operator_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `villager` (
  `House_No` int NOT NULL AUTO_INCREMENT,
  `Villager_Name` varchar(45) NOT NULL,
  `Contact_No` varchar(10) DEFAULT NULL,
  `V_Pump_Operator_ID` int NOT NULL,
  `Pay_Status` varchar(10) DEFAULT NULL,
  `No_Of_Complaints` int DEFAULT NULL,
  `Pending_Complaints` int DEFAULT NULL,
  `V_email` varchar(45) NOT NULL,
  `V_password` varchar(255) NOT NULL,
  PRIMARY KEY (`House_No`),
  UNIQUE KEY `Villager_Name_UNIQUE` (`Villager_Name`),
  UNIQUE KEY `House_No_UNIQUE` (`House_No`),
  UNIQUE KEY `V_email_UNIQUE` (`V_email`),
  UNIQUE KEY `V_password_UNIQUE` (`V_password`),
  UNIQUE KEY `Contact_No_UNIQUE` (`Contact_No`),
  KEY `Pump_Operator_ID_idx` (`V_Pump_Operator_ID`),
  CONSTRAINT `V_Pump_Operator_ID` FOREIGN KEY (`V_Pump_Operator_ID`) REFERENCES `operator` (`Pump_Operator_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `feedback` (
  `Feedback_ID` int NOT NULL AUTO_INCREMENT,
  `F_House_No` int NOT NULL,
  `Description` varchar(1000) NOT NULL,
  `Date_Issued` date NOT NULL,
  `F_Pump_Operator_ID` int NOT NULL,
  `Feedback_Status` varchar(30) NOT NULL,
  PRIMARY KEY (`Feedback_ID`,`F_House_No`),
  UNIQUE KEY `Feedback_ID_UNIQUE` (`Feedback_ID`),
  KEY `F_House_No_idx` (`F_House_No`),
  KEY `F_Pump_Operator_ID_idx` (`F_Pump_Operator_ID`),
  CONSTRAINT `F_House_No` FOREIGN KEY (`F_House_No`) REFERENCES `villager` (`House_No`) ON UPDATE CASCADE,
  CONSTRAINT `F_Pump_Operator_ID` FOREIGN KEY (`F_Pump_Operator_ID`) REFERENCES `operator` (`Pump_Operator_ID`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
