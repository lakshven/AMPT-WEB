import bcrypt from "bcryptjs";

async function runCheck() {
  const password = "appadmintest1";
  const hash = "$2b$10$bArMeOwyx7h.zyxDq32ayuUqz9.FzxR29vyOr1Sv8Zo9fnC..reYm";

  const match = await bcrypt.compare(password, hash);
  console.log("Match:", match);
}

runCheck();