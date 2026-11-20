import express from "express";
const router = express.Router();
export default router;

import {
  createUser,
  getUserById,
  getUserByUsernameAndPassword,
} from "#db/queries/users";
import requireBody from "#middleware/requireBody";
import { createToken } from "#utils/jwt";
import { isAdminEmail } from "#utils/admin";
import getUserFromToken from "#middleware/getUserFromToken";

router
  .route("/register")
  .post(
    requireBody(["firstName", "lastName", "username", "email", "password"]),
    async (req, res) => {
      const { firstName, lastName, username, email, password } = req.body;
      // Only emails listed in ADMIN_EMAILS (.env) become admins
      const isAdmin = isAdminEmail(email);
      const user = await createUser(
        firstName,
        lastName,
        username,
        email,
        password,
        isAdmin,
      );

      const token = await createToken({ id: user.id });
      res.status(201).send(token);
    },
  );

router
  .route("/login")
  .post(requireBody(["username", "password"]), async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsernameAndPassword(username, password);
    if (!user) return res.status(401).send("Invalid username or password.");

    const token = await createToken({ id: user.id });
    res.send(token);
  });

router.get("/profile", getUserFromToken, async (req, res) => {
  const user = await getUserById(req.user.id);

  if (!user) {
    return res.status(404).send("User not found");
  }

  res.send(user);
});
