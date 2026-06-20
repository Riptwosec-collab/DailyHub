import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "package.json",
  ".env.example",
  "src/app/page.tsx",
  "src/app/dashboard/page.tsx",
  "src/app/scheduled-tasks/page.tsx",
  "src/app/task-results/page.tsx",
  "src/app/notifications/page.tsx",
  "src/app/admin/page.tsx",
  "src/app/api/health/route.ts",
  "src/app/api/scheduler/tick/route.ts",
  "vercel.json",
];

const missing = requiredFiles.filter((file) => !existsSync(join(root, file)));

if (missing.length > 0) {
  console.error("\nDailyHub AI QA failed. Missing files:\n");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const scripts = pkg.scripts ?? {};
const requiredScripts = ["dev", "build", "lint", "typecheck"];
const missingScripts = requiredScripts.filter((name) => !scripts[name]);

if (missingScripts.length > 0) {
  console.error("\nDailyHub AI QA failed. Missing npm scripts:\n");
  for (const script of missingScripts) console.error(`- ${script}`);
  process.exit(1);
}

console.log("DailyHub AI QA file check passed.");
console.log("Next steps: npm run typecheck && npm run lint && npm run build");
