import { sql } from "../_lib/db.js";
import { wrap } from "../_lib/http.js";
import {
  clearSessionCookie,
  revokeCurrentSession,
} from "../_lib/session.js";

export default wrap(async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }

  await revokeCurrentSession(sql, req);
  clearSessionCookie(res);

  return res.status(200).json({ ok: true });
});
