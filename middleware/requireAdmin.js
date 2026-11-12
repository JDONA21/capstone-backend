/** Requires a logged-in user */
export default async function requireAdmin(req, res, next) {
  if (!req.user.is_admin) return res.status(401).send("Unauthorized");
  next();
}
