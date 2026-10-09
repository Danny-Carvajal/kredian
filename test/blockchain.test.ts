import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  calcularHashSello,
  esHashValido,
  normalizarFechaEmision,
  normalizarHash,
  normalizarVerificadoEn,
  textoCanonicoSello,
  validarDatosSello,
  ErrorDatosSello,
  leerSelladoEn,
} from "../src/lib/blockchain";

// Cargar variables si existe .env.local para la prueba de Sepolia
const rutaEnv = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(rutaEnv) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(rutaEnv);
}

test("textoCanonicoSello genera claves en el orden exacto de PROYECTO.md", () => {
  const datos = {
    fuente: "credly",
    badge_id: "badge-123",
    titulo: "AWS Cloud Practitioner",
    emisor: "Amazon Web Services",
    fecha_emision: "2026-10-08",
    estado: "vigente",
    verificado_en: "2026-10-08T23:12:34.567Z",
  };

  const jsonTexto = textoCanonicoSello(datos);
  const claves = Object.keys(JSON.parse(jsonTexto));

  assert.deepStrictEqual(claves, [
    "fuente",
    "badge_id",
    "titulo",
    "emisor",
    "fecha_emision",
    "estado",
    "verificado_en",
  ]);

  // Sin espacios en blanco adicionales entre separadores
  assert.strictEqual(
    jsonTexto,
    '{"fuente":"credly","badge_id":"badge-123","titulo":"AWS Cloud Practitioner","emisor":"Amazon Web Services","fecha_emision":"2026-10-08","estado":"vigente","verificado_en":"2026-10-08T23:12:34.567Z"}',
  );
});

test("calcularHashSello genera un hash SHA-256 de 32 bytes en formato hex (0x...)", () => {
  const datos = {
    fuente: "credly",
    badge_id: "badge-123",
    titulo: "AWS Cloud Practitioner",
    emisor: "Amazon Web Services",
    fecha_emision: "2026-10-08",
    estado: "vigente",
    verificado_en: "2026-10-08T23:12:34.567Z",
  };

  const hash = calcularHashSello(datos);
  assert.match(hash, /^0x[0-9a-f]{64}$/);
});

test("normalizarFechaEmision valida y extrae YYYY-MM-DD", () => {
  assert.strictEqual(normalizarFechaEmision("2026-10-08"), "2026-10-08");
  assert.strictEqual(normalizarFechaEmision("2026-10-08T15:30:00.000Z"), "2026-10-08");
  assert.throws(() => normalizarFechaEmision("fecha-invalida"), ErrorDatosSello);
});

test("normalizarVerificadoEn normaliza timestamps de Supabase (+00:00)", () => {
  const fechaConOffset = "2026-10-08T23:12:34.567+00:00";
  const normalizada = normalizarVerificadoEn(fechaConOffset);
  assert.strictEqual(normalizada, "2026-10-08T23:12:34.567Z");
  assert.throws(() => normalizarVerificadoEn("no-es-fecha"), ErrorDatosSello);
});

test("validarDatosSello soporta 'sellado_en' de Supabase como alias de 'verificado_en'", () => {
  const entrada = {
    fuente: "credly",
    badge_id: "badge-999",
    titulo: "Terraform Associate",
    emisor: "HashiCorp",
    fecha_emision: "2025-05-12",
    estado: "vigente",
    sellado_en: "2026-10-08T23:12:34.567+00:00",
  };

  const resultado = validarDatosSello(entrada);
  assert.strictEqual(resultado.verificado_en, "2026-10-08T23:12:34.567Z");
  assert.strictEqual(resultado.fuente, "credly");
  assert.strictEqual(resultado.estado, "vigente");
});

test("validarDatosSello genera verificado_en si se permite y no viene provisto", () => {
  const entrada = {
    fuente: "credly",
    badge_id: "badge-auto",
    titulo: "Azure Fundamentals",
    emisor: "Microsoft",
    fecha_emision: "2026-01-15",
    estado: "vigente",
  };

  const resultado = validarDatosSello(entrada, true);
  assert.ok(resultado.verificado_en);
  assert.match(resultado.verificado_en, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
});

test("validarDatosSello rechaza fuentes distintas a 'credly' y estados invalidos", () => {
  assert.throws(
    () =>
      validarDatosSello({
        fuente: "otra_fuente",
        badge_id: "1",
        titulo: "Cert",
        emisor: "Org",
        fecha_emision: "2026-01-01",
        estado: "vigente",
        verificado_en: new Date().toISOString(),
      }),
    ErrorDatosSello,
  );

  assert.throws(
    () =>
      validarDatosSello({
        fuente: "credly",
        badge_id: "1",
        titulo: "Cert",
        emisor: "Org",
        fecha_emision: "2026-01-01",
        estado: "invalido",
        verificado_en: new Date().toISOString(),
      }),
    ErrorDatosSello,
  );
});

test("normalizarHash y esHashValido aceptan formatos con y sin 0x", () => {
  const hashCon0x = "0x11ce610691987d2c174d132b7158976f759b55138f2af36cadc15ebead163c8d";
  const hashSin0x = "11ce610691987d2c174d132b7158976f759b55138f2af36cadc15ebead163c8d";

  assert.strictEqual(normalizarHash(hashCon0x), hashCon0x.toLowerCase());
  assert.strictEqual(normalizarHash(hashSin0x), hashCon0x.toLowerCase());
  assert.strictEqual(normalizarHash("invalido"), null);

  assert.strictEqual(esHashValido(hashCon0x), true);
  assert.strictEqual(esHashValido(hashSin0x), true);
  assert.strictEqual(esHashValido("0x123"), false);
});

test("detecta alteracion de credenciales (recalculo genera hash distinto)", () => {
  const original = {
    fuente: "credly",
    badge_id: "b-1",
    titulo: "AWS Cloud Practitioner",
    emisor: "AWS",
    fecha_emision: "2026-10-08",
    estado: "vigente",
    verificado_en: "2026-10-08T20:00:00.000Z",
  };
  const alterado = {
    ...original,
    titulo: "AWS Solutions Architect Professional", // Titulo alterado fraudulentamente
  };

  const hashOriginal = calcularHashSello(original);
  const hashAlterado = calcularHashSello(alterado);

  assert.notStrictEqual(hashOriginal, hashAlterado);
});

test(
  "leerSelladoEn consulta contrato en Sepolia y confirma el sello real previamente emitido",
  { skip: !process.env.KREDIAN_CONTRACT_ADDRESS },
  async () => {
    const hashPrueba = "0x11ce610691987d2c174d132b7158976f759b55138f2af36cadc15ebead163c8d";
    const timestamp = await leerSelladoEn(hashPrueba);
    assert.strictEqual(timestamp, 1791507720);
  },
);

test("getSepoliaProvider y getContractReadOnly reutilizan instancias cacheadas", async () => {
  process.env.KREDIAN_CONTRACT_ADDRESS ??=
    "0x55C27efcF6d8707315f95FEaC8Ad569488fEe75E";
  const { getSepoliaProvider, getContractReadOnly } = await import("../src/lib/blockchain");
  const p1 = getSepoliaProvider();
  const p2 = getSepoliaProvider();
  assert.strictEqual(p1, p2);

  const c1 = getContractReadOnly();
  const c2 = getContractReadOnly();
  assert.strictEqual(c1, c2);
});

test("urlEtherscanTx normaliza prefijo 0x", async () => {
  const { urlEtherscanTx, urlEtherscanContrato } = await import("../src/lib/blockchain");
  assert.strictEqual(
    urlEtherscanTx("448ed6f933ddf1f047c3a93455d872307ec5bc8664576386568f5aa92589db2d"),
    "https://sepolia.etherscan.io/tx/0x448ed6f933ddf1f047c3a93455d872307ec5bc8664576386568f5aa92589db2d",
  );
  assert.strictEqual(
    urlEtherscanContrato("0x55C27efcF6d8707315f95FEaC8Ad569488fEe75E"),
    "https://sepolia.etherscan.io/address/0x55C27efcF6d8707315f95FEaC8Ad569488fEe75E",
  );
});
