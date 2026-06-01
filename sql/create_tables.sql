-- -- public.contactlists definition

-- -- Drop table

-- -- DROP TABLE public.contactlists;

-- CREATE TABLE public.contactlists (
-- 	contactgroupid uuid DEFAULT gen_random_uuid() NOT NULL,
-- 	"name" text NOT NULL,
-- 	description text NULL,
-- 	created_at timestamp NOT NULL,
-- 	updated_at timestamp NULL,
-- 	user_id int4 NULL,
-- 	CONSTRAINT contactlists_pkey PRIMARY KEY (contactgroupid)
-- );


-- -- public.recipients definition

-- -- Drop table

-- -- DROP TABLE public.recipients;

-- CREATE TABLE public.recipients (
-- 	recipientid uuid DEFAULT gen_random_uuid() NOT NULL,
-- 	recipientfirstname text NOT NULL,
-- 	recipientlastname text NOT NULL,
-- 	recipientphonenumber text NULL,
-- 	recipientemail text NOT NULL,
-- 	CONSTRAINT recipients_pkey PRIMARY KEY (recipientid)
-- );


-- -- public.users definition

-- -- Drop table

-- -- DROP TABLE public.users;

-- CREATE TABLE public.users (
-- 	id serial4 NOT NULL,
-- 	firebase_uid varchar(128) NOT NULL,
-- 	username varchar(50) NOT NULL,
-- 	email varchar(255) NOT NULL,
-- 	firstname varchar(100) DEFAULT NULL::character varying NULL,
-- 	lastname varchar(100) DEFAULT NULL::character varying NULL,
-- 	created_at timestamptz DEFAULT now() NOT NULL,
-- 	updated_at timestamptz DEFAULT now() NOT NULL,
-- 	CONSTRAINT users_email_key UNIQUE (email),
-- 	CONSTRAINT users_firebase_uid_key UNIQUE (firebase_uid),
-- 	CONSTRAINT users_pkey PRIMARY KEY (id),
-- 	CONSTRAINT users_username_key UNIQUE (username)
-- );


-- -- public.contactlists_users definition

-- -- Drop table

-- -- DROP TABLE public.contactlists_users;

-- CREATE TABLE public.contactlists_users (
-- 	contactgroupid uuid NOT NULL,
-- 	recipientid uuid NOT NULL,
-- 	CONSTRAINT contactlists_users_pkey PRIMARY KEY (contactgroupid, recipientid),
-- 	CONSTRAINT fk_clu_contactlist FOREIGN KEY (contactgroupid) REFERENCES public.contactlists(contactgroupid) ON DELETE CASCADE,
-- 	CONSTRAINT fk_clu_recipient FOREIGN KEY (recipientid) REFERENCES public.recipients(recipientid) ON DELETE CASCADE
-- );


-- -- public.signuplinks definition

-- -- Drop table

-- -- DROP TABLE public.signuplinks;

-- CREATE TABLE public.signuplinks (
-- 	linkid serial4 NOT NULL,
-- 	signuptoken varchar(255) NOT NULL,
-- 	expirydate timestamp NOT NULL,
-- 	createdby int4 NOT NULL,
-- 	CONSTRAINT signuplinks_pkey PRIMARY KEY (linkid),
-- 	CONSTRAINT signuplinks_signuptoken_key UNIQUE (signuptoken),
-- 	CONSTRAINT fk_signuplinks_user FOREIGN KEY (createdby) REFERENCES public.users(id) ON DELETE CASCADE
-- );


-- -- public.templates definition

-- -- Drop table

-- -- DROP TABLE public.templates;

-- CREATE TABLE public.templates (
-- 	templateid uuid NOT NULL,
-- 	subject text NOT NULL,
-- 	body text NOT NULL,
-- 	createdon timestamp NOT NULL,
-- 	createdby int4 NULL,
-- 	"name" text NOT NULL,
-- 	customname bool DEFAULT false NULL,
-- 	editedon timestamp NULL,
-- 	CONSTRAINT templates_pkey PRIMARY KEY (templateid),
-- 	CONSTRAINT fk_templates_user FOREIGN KEY (createdby) REFERENCES public.users(id) ON DELETE CASCADE
-- );


-- -- public.mailobject definition

-- -- Drop table

-- -- DROP TABLE public.mailobject;

-- CREATE TABLE public.mailobject (
-- 	mailobjectid uuid NOT NULL,
-- 	templateid uuid NOT NULL,
-- 	contactgroupid uuid NOT NULL,
-- 	recipientid uuid NULL,
-- 	CONSTRAINT mailobject_pkey PRIMARY KEY (mailobjectid),
-- 	CONSTRAINT mailobject_target_check CHECK ((((contactgroupid IS NOT NULL) AND (recipientid IS NULL)) OR ((contactgroupid IS NULL) AND (recipientid IS NOT NULL)))),
-- 	CONSTRAINT fk_mailobject_contactlist FOREIGN KEY (contactgroupid) REFERENCES public.contactlists(contactgroupid) ON DELETE CASCADE,
-- 	CONSTRAINT fk_mailobject_template FOREIGN KEY (templateid) REFERENCES public.templates(templateid) ON DELETE CASCADE
-- );


-- -- public.scheduledsends definition

-- -- Drop table

-- -- DROP TABLE public.scheduledsends;

-- CREATE TABLE public.scheduledsends (
-- 	mailobjectid uuid NOT NULL,
-- 	sendate timestamp NOT NULL,
-- 	sent bool DEFAULT false NULL,
-- 	CONSTRAINT scheduledsends_pkey PRIMARY KEY (mailobjectid),
-- 	CONSTRAINT fk_scheduled_mailobject FOREIGN KEY (mailobjectid) REFERENCES public.mailobject(mailobjectid) ON DELETE CASCADE
-- );