import assert from "node:assert/strict";
import { test } from "node:test";
import { asignarRango, RANGOS_SEMILLA } from "../src/lib/rangos";

test("hay al menos 20 patrones de rango", () => {
  assert.ok(RANGOS_SEMILLA.length >= 20);
});

test("asignarRango elige el patrón más específico", () => {
  assert.equal(
    asignarRango("AWS Educate Introduction to Cloud 101"),
    "bronce",
  );
  assert.equal(
    asignarRango("AWS Certified Solutions Architect – Professional"),
    "platino",
  );
  assert.equal(asignarRango("Curso de cocina"), null);
});
