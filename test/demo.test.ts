import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import { credencialesDemo, isDemoConfigured } from "../src/lib/demo";

const EMAIL = "KREDIAN_DEMO_EMAIL";
const PASS = "KREDIAN_DEMO_PASSWORD";

afterEach(() => {
  delete process.env[EMAIL];
  delete process.env[PASS];
});

describe("credencialesDemo", () => {
  test("sin env no hay demo (la clave no vive en el repo)", () => {
    delete process.env[EMAIL];
    delete process.env[PASS];
    assert.equal(credencialesDemo(), null);
    assert.equal(isDemoConfigured(), false);
  });

  test("hace falta correo y contraseña", () => {
    process.env[EMAIL] = "demo@kredian.local";
    process.env[PASS] = "";
    assert.equal(credencialesDemo(), null);

    process.env[PASS] = "secreto-demo";
    assert.deepEqual(credencialesDemo(), {
      correo: "demo@kredian.local",
      clave: "secreto-demo",
    });
  });
});
