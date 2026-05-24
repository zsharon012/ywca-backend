-- Supabase / PostgreSQL
-- Run this in the Supabase SQL Editor (supabase.com → project → SQL Editor)

-- Users Table
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  username     VARCHAR(50)  NOT NULL UNIQUE,
  email        VARCHAR(255) NOT NULL UNIQUE,
  firstname    VARCHAR(100) DEFAULT NULL,
  lastname     VARCHAR(100) DEFAULT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -- Templates Table - FOR DOCUMENTATION
-- CREATE TABLE templates (
--     templateid UUID PRIMARY KEY,
--     subject TEXT NOT NULL,
--     body TEXT NOT NULL,
--     createdon TIMESTAMP NOT NULL,
--     createdby INTEGER NOT NULL,
--     name TEXT NOT NULL,
--     customname BOOLEAN DEFAULT FALSE,
--     editedon TIMESTAMP,
--     CONSTRAINT fk_templates_user
--         FOREIGN KEY (createdby) REFERENCES public.users(id) ON DELETE CASCADE
-- );

-- -- Contact Lists Table
-- CREATE TABLE contactlists (
--     contactgroupid UUID PRIMARY KEY,
--     user_id INTEGER NOT NULL,
--     name TEXT NOT NULL,
--     description TEXT,
--     created_at TIMESTAMP NOT NULL,
--     updated_at TIMESTAMP,
--     CONSTRAINT fk_contactlists_user
--         FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
-- );

-- -- Recipients Table
-- CREATE TABLE recipients (
--     recipientid UUID PRIMARY KEY,
--     recipientfirstname TEXT NOT NULL,
--     recipientlastname TEXT NOT NULL,
--     recipientphonenumber TEXT,
--     recipientemail TEXT NOT NULL
-- );

-- -- Join Table: ContactLists_Users
-- CREATE TABLE contactlists_users (
--     contactgroupid UUID NOT NULL,
--     recipientid UUID NOT NULL,
--     PRIMARY KEY (contactgroupid, recipientid),
--     CONSTRAINT fk_clu_contactlist
--         FOREIGN KEY (contactgroupid) REFERENCES contactlists(contactgroupid) ON DELETE CASCADE,
--     CONSTRAINT fk_clu_recipient
--         FOREIGN KEY (recipientid) REFERENCES recipients(recipientid) ON DELETE CASCADE
-- );

-- -- MailObject Table
-- CREATE TABLE mailobject (
--     mailobjectid UUID PRIMARY KEY,
--     templateid UUID NOT NULL,
--     contactgroupid UUID NOT NULL,
--     CONSTRAINT fk_mailobject_template
--         FOREIGN KEY (templateid) REFERENCES templates(templateid) ON DELETE CASCADE,
--     CONSTRAINT fk_mailobject_contactlist
--         FOREIGN KEY (contactgroupid) REFERENCES contactlists(contactgroupid) ON DELETE CASCADE
-- );

-- -- Scheduled Sends Table
-- CREATE TABLE scheduledsends (
--     mailobjectid UUID PRIMARY KEY,
--     sendate TIMESTAMP NOT NULL,
--     sent BOOLEAN DEFAULT FALSE,
--     CONSTRAINT fk_scheduled_mailobject
--         FOREIGN KEY (mailobjectid) REFERENCES mailobject(mailobjectid) ON DELETE CASCADE
-- );

-- Signup Links Table
CREATE TABLE signuplinks (
    linkid SERIAL PRIMARY KEY,
    signuptoken VARCHAR(255) UNIQUE NOT NULL,
    expirydate TIMESTAMP NOT NULL,
    createdby INTEGER NOT NULL,
    CONSTRAINT fk_signuplinks_user
        FOREIGN KEY (createdby) REFERENCES public.users(id) ON DELETE CASCADE
);

-- -- Image Bucket Table
-- CREATE TABLE imagebucket (
--     imageid UUID PRIMARY KEY,
--     imageurl TEXT NOT NULL
-- );
