import assert from "node:assert/strict";
import { test } from "node:test";
import { nombresCoinciden, normalizarNombre } from "../src/lib/nombres";

test("normalizarNombre quita tildes y mayúsculas", () => {
  assert.equal(normalizarNombre("José  María"), "jose maria");
  assert.equal(normalizarNombre("DANNY-Carvajal"), "danny carvajal");
});

test("nombresCoinciden ignora tildes, mayúsculas y espacios", () => {
  assert.equal(nombresCoinciden("José Daniel", "jose  daniel"), true);
  assert.equal(nombresCoinciden("Ana", "Ana Pérez"), false);
  assert.equal(nombresCoinciden("  ", "Ana"), false);
});
