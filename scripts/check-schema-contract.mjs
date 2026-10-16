import ts from "typescript";
import fs from "node:fs";
import assert from "node:assert/strict";
const schema = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const source = ts.createSourceFile(
  "database.types.ts",
  fs.readFileSync("src/lib/library/database.types.ts", "utf8"),
  ts.ScriptTarget.Latest,
  true,
);
const declarations = source.statements.filter(ts.isInterfaceDeclaration);
const db = declarations.find((n) => n.name.text === "Database");
const publicType = db.members.find(
  (n) => n.name.getText(source) === "public",
).type;
const tables = publicType.members.find(
  (n) => n.name.getText(source) === "Tables",
).type;
let count = 0;
for (const table of tables.members) {
  const name = table.name.getText(source);
  const rowName = table.type.typeArguments[0].getText(source);
  const row = declarations.find((n) => n.name.text === rowName);
  const fields = row
    ? row.members.map((n) => n.name.getText(source))
    : table.type.typeArguments[0].members.map((n) => n.name.getText(source));
  assert.deepEqual(
    [...fields].sort(),
    [...schema[name]].sort(),
    `Contract drift: ${name}`,
  );
  count++;
}
console.log(
  `Schema contract: ${count} TypeScript row contracts match the migrated PostgreSQL columns.`,
);
