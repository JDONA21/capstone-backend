import db from "#db/client";
import bcrypt from "bcrypt";

export async function createUser(
  firstName,
  lastName,
  username,
  email,
  password,
  isAdmin,
) {
  const sql = `
  INSERT INTO users
    (first_name, last_name, username, email, password, is_admin)
  VALUES
    ($1, $2, $3, $4, $5, $6)
  RETURNING id, first_name, last_name, username, email, is_admin
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(sql, [
    firstName,
    lastName,
    username,
    email,
    hashedPassword,
    isAdmin,
  ]);
  return user;
}

export async function getUserByUsernameAndPassword(username, password) {
  const sql = `
  SELECT *
  FROM users
  WHERE username = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [username]);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

/** Never returns the password hash, so it's safe to send to the browser */
export async function getUserById(id) {
  const sql = `
  SELECT id, first_name, last_name, username, email, is_admin
  FROM users
  WHERE id = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [id]);
  return user;
}
