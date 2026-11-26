import { createHash, randomBytes } from "node:crypto";

const token = randomBytes(32).toString("base64url");
const hash = createHash("sha256").update(token).digest("hex");

console.log("Copie o token abaixo agora; ele não será gravado em arquivo:");
console.log(token);
console.log("\nDefina esta variável secreta na Vercel:");
console.log(`API_V1_TOKEN_HASH=${hash}`);
