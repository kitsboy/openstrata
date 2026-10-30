import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const codes = ['fr', 'es', 'zh', 'hi', 'fil', 'pl', 'uk', 'sw'];

function catalog(file, english = false) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  let object;
  if (english) {
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      const declaration = statement.declarationList.declarations.find((item) => item.name.getText(source) === 'english');
      if (declaration) object = declaration.initializer;
    }
  } else {
    const assignment = source.statements.find(ts.isExportAssignment);
    const expr = assignment?.expression;
    object = expr && ts.isSatisfiesExpression(expr) ? expr.expression : expr;
  }
  if (!object || !ts.isObjectLiteralExpression(object)) throw new Error(`Catalog not found: ${file}`);
  const entries = new Map();
  for (const item of object.properties) {
    if (!ts.isPropertyAssignment(item) || !ts.isIdentifier(item.name) || !ts.isStringLiteral(item.initializer)) {
      throw new Error(`Unsupported catalog entry in ${file}: ${item.getText(source).slice(0, 80)}`);
    }
    if (entries.has(item.name.text)) throw new Error(`Duplicate key ${item.name.text} in ${file}`);
    entries.set(item.name.text, item.initializer.text);
  }
  return entries;
}

const english = catalog(path.join(root, 'src/lib/i18n.ts'), true);
const catalogs = Object.fromEntries(codes.map((code) => [code, catalog(path.join(root, `src/lib/locales/${code}.ts`))]));
const csv = (value) => `"${String(value).replaceAll('"', '""')}"`;
const rows = [['key', 'english', ...codes, 'review_notes']];
for (const [key, value] of english) {
  rows.push([key, value, ...codes.map((code) => catalogs[code].get(key) ?? ''), '']);
}
const output = rows.map((row) => row.map(csv).join(',')).join('\r\n') + '\r\n';
process.stdout.write('\uFEFF' + output);
