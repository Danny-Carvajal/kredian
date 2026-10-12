import assert from "node:assert/strict";
import { test } from "node:test";
import { extraerBadgeId } from "../src/lib/credly";
import { ejemploPorUrl } from "../src/data/credly-ejemplos";

test("extraerBadgeId lee el uuid de un link público de Credly", () => {
  const id = "a1b2c3d4-e5f6-4111-8111-a1b2c3d4e5f6";
  assert.equal(
    extraerBadgeId(`https://www.credly.com/badges/${id}/public_url`),
    id,
  );
  assert.equal(extraerBadgeId("https://example.com/badges/" + id), null);
  assert.equal(extraerBadgeId("no es una url"), null);
});

test("plan B elige un ejemplo distinto según el slug de la URL", () => {
  assert.equal(
    ejemploPorUrl(
      "https://www.credly.com/badges/plan-b-aws-cloud-practitioner/public_url",
      null,
    ).titulo,
    "AWS Certified Cloud Practitioner",
  );
  assert.equal(
    ejemploPorUrl(
      "https://www.credly.com/badges/plan-b-comptia-security-plus/public_url",
      null,
    ).titulo,
    "CompTIA Security+",
  );
});
