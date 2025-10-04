-- DROP TABLE IF EXISTS Customers;
-- CREATE TABLE IF NOT EXISTS Customers (
--   CustomerId INTEGER PRIMARY KEY,
--   CompanyName TEXT,
--   ContactName TEXT
-- );
-- INSERT INTO Customers (CustomerID, CompanyName, ContactName)
-- VALUES (1, 'Alfreds Futterkiste', 'Maria Anders'), (4, 'Around the Horn', 'Thomas Hardy'), (11, 'Bs Beverages', 'Victoria Ashworth'), (13, 'Bs Beverages', 'Random Name');

-- Users table, using phone_number as primary key
CREATE TABLE IF NOT EXISTS Users (
  phone_number TEXT PRIMARY KEY,
  name TEXT,
  email TEXT
);

-- Groups table
CREATE TABLE IF NOT EXISTS Groups (
  group_id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT
);

-- Membership table to link users and groups (many-to-many)
CREATE TABLE IF NOT EXISTS GroupMemberships (
  group_id INTEGER,
  phone_number TEXT,
  PRIMARY KEY (group_id, phone_number),
  FOREIGN KEY (group_id) REFERENCES Groups(group_id),
  FOREIGN KEY (phone_number) REFERENCES Users(phone_number)
);
