-- AWS RDS / MySQL
-- Run this after connecting to your RDS instance

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid  VARCHAR(128) NOT NULL,
  username      VARCHAR(50)  NOT NULL,
  email         VARCHAR(255) NOT NULL,
  firstname     VARCHAR(100) DEFAULT NULL,
  lastname      VARCHAR(100) DEFAULT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY idx_firebase_uid (firebase_uid),
  UNIQUE KEY idx_username     (username),
  UNIQUE KEY idx_email        (email)
);

CREATE TABLE IF NOT EXISTS signuplinks (
  linkid        INT AUTO_INCREMENT PRIMARY KEY,
  signuptoken   VARCHAR(255) NOT NULL UNIQUE,
  expirydate    DATETIME     NOT NULL,
  createdby     INT          NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_signuplinks_user
    FOREIGN KEY (createdby) REFERENCES users(id) ON DELETE CASCADE
);
