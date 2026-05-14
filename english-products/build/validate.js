/**
 * validate.js — JSON Schema validation via Ajv for lesson content.
 */
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFile } from "node:fs/promises";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemaCache = new Map();

export async function validateLesson(lesson, schemaPath) {
  let validator = schemaCache.get(schemaPath);
  if (!validator) {
    const schema = JSON.parse(await readFile(schemaPath, "utf8"));
    validator = ajv.compile(schema);
    schemaCache.set(schemaPath, validator);
  }
  const ok = validator(lesson);
  if (!ok) {
    const errs = (validator.errors || []).map(e => `  - ${e.instancePath || "/"} ${e.message}`).join("\n");
    throw new Error(`Schema validation failed:\n${errs}`);
  }
  return true;
}
