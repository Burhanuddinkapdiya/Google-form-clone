-- Survey Form Table Structure
CREATE TABLE `survey_form` (
  `s_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`s_id`)
)

-- Survey Questions Table Structure 
CREATE TABLE `survey_questions` (
  `s_id` int NOT NULL,
  `type` enum('date','file','checkbox','dropdown','multipleChoice','paragraph') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `label` varchar(255) NOT NULL,
  `options` text,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `q_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`q_id`),
  KEY `form_id` (`s_id`)
) 

-- Survey Answers Table Structure
CREATE TABLE `survey_answers` (
  `sa_id` int NOT NULL AUTO_INCREMENT,
  `s_id` int NOT NULL,
  `q_id` int NOT NULL,
  `answer` text,
  `its_id` int,
  PRIMARY KEY (`sa_id`),
  KEY `fk_survey_form` (`s_id`),
  KEY `fk_survey_questions` (`q_id`),
  CONSTRAINT `fk_survey_form` FOREIGN KEY (`s_id`) REFERENCES `survey_form` (`s_id`),
  CONSTRAINT `fk_survey_questions` FOREIGN KEY (`q_id`) REFERENCES `survey_questions` (`q_id`)
)