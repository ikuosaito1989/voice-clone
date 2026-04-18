import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { genSaltSync, hashSync } from "bcryptjs";

type CreateUserOptions = {
  database: string;
  displayName?: string;
  dryRun: boolean;
  email?: string;
  id?: string;
  mode: "local" | "remote";
  password?: string;
  role: string;
};

function parseArgs(argv: string[]) {
  const options: CreateUserOptions = {
    database: "voice-clone",
    role: "user",
    mode: "local",
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--email") {
      options.email = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--password") {
      options.password = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--name") {
      options.displayName = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--role") {
      options.role = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--id") {
      options.id = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--database") {
      options.database = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--remote") {
      options.mode = "remote";
      continue;
    }

    if (arg === "--local") {
      options.mode = "local";
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
  }

  return options;
}

function escapeSql(value: string) {
  return value.replaceAll("'", "''");
}

function requiredOption(options: CreateUserOptions, key: "email" | "password") {
  const value = options[key];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new Error(`Missing required option: --${key}`);
}

function buildInsertSql(options: CreateUserOptions) {
  const id = options.id ?? randomUUID();
  const email = requiredOption(options, "email").trim().toLowerCase();
  const password = requiredOption(options, "password");
  const displayName = options.displayName?.trim() || null;
  const role = options.role?.trim() || "user";
  const passwordHash = hashSync(password, genSaltSync(12));

  const values = [
    `'${escapeSql(id)}'`,
    `'${escapeSql(email)}'`,
    `'${escapeSql(passwordHash)}'`,
    displayName ? `'${escapeSql(displayName)}'` : "NULL",
    `'${escapeSql(role)}'`,
    "1",
    "unixepoch()",
    "unixepoch()",
  ];

  return `INSERT INTO users (
  id,
  email,
  password_hash,
  display_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  ${values.join(",\n  ")}
);`;
}

function printUsage() {
  console.log(`Usage:
  pnpm create:user --email user@example.com --password secret [--name "Demo User"] [--role admin] [--remote] [--dry-run]

Examples:
  pnpm create:user --email demo@example.com --password password --name "Demo User"
  pnpm create:user --email admin@example.com --password password --role admin --remote
  pnpm create:user --email demo@example.com --password password --dry-run`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printUsage();
    return;
  }

  const sql = buildInsertSql(options);

  if (options.dryRun) {
    console.log(sql);
    return;
  }

  const wranglerArgs = [
    "exec",
    "wrangler",
    "d1",
    "execute",
    options.database,
    options.mode === "remote" ? "--remote" : "--local",
    "--command",
    sql,
  ];

  execFileSync("pnpm", wranglerArgs, { stdio: "inherit" });
  console.log(`Created user ${options.email} in ${options.mode} database.`);
}

main();
