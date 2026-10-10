import assert from "node:assert/strict";
import test from "node:test";
import { calcularHashSello, type DatosCredencialParaSello, type ResultadoSello } from "../src/lib/blockchain";
import {
  ErrorSolicitudSello,
  type FilaCredencial,
  procesarSolicitudSello,
  type SelloGuardado,
} from "../src/lib/sellar-solicitud";

const USUARIO = "11111111-1111-4111-8111-111111111111";
const OTRO = "33333333-3333-4333-8333-333333333333";
const CREDENCIAL = "22222222-2222-4222-8222-222222222222";
const VERIFICADO = "2026-10-08T23:12:34.567Z";
const TX = "0x448ed6f933ddf1f047c3a93455d872307ec5bc8664576386568f5aa92589db2d";

function fila(parcial: Partial<FilaCredencial> = {}): FilaCredencial {
  return {
    id: CREDENCIAL,
    user_id: USUARIO,
    fuente: "credly",
    badge_id: "badge-123",
    titulo: "AWS Cloud Practitioner",
    emisor: "Amazon Web Services",
    fecha_emision: "2026-10-08",
    estado: "vigente",
    hash: null,
    tx_hash: null,
    sellado_en: null,
    ...parcial,
  };
}

function resultadoDe(datos: DatosCredencialParaSello, parcial: Partial<ResultadoSello> = {}): ResultadoSello {
  return {
    hash: calcularHashSello(datos),
    datos,
    ya_existia: false,
    confirmado: true,
    tx_hash: TX,
    block_number: 123,
    sellado_en_blockchain: "2026-10-08T23:20:00.000Z",
    etherscan_url: `https://sepolia.etherscan.io/tx/${TX}`,
    ...parcial,
  };
}

test("rechaza sellar sin sesión y no toca la cadena ni la tabla", async () => {
  let lecturas = 0;
  let sellos = 0;
  let guardados = 0;

  await assert.rejects(
    () =>
      procesarSolicitudSello({
        userId: null,
        body: { credencial_id: CREDENCIAL, titulo: "inventado" },
        obtenerCredencial: async () => {
          lecturas += 1;
          return fila();
        },
        reservarSelladoEn: async () => "ok",
        guardarSello: async () => {
          guardados += 1;
        },
        sellar: async () => {
          sellos += 1;
          throw new Error("no debería sellar");
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof ErrorSolicitudSello);
      assert.equal(error.status, 401);
      return true;
    },
  );

  assert.equal(lecturas, 0);
  assert.equal(sellos, 0);
  assert.equal(guardados, 0);
});

test("rechaza una credencial de otro usuario antes de sellar", async () => {
  let sellos = 0;
  let guardados = 0;

  await assert.rejects(
    () =>
      procesarSolicitudSello({
        userId: USUARIO,
        body: { credencial_id: CREDENCIAL },
        obtenerCredencial: async () => fila({ user_id: OTRO }),
        reservarSelladoEn: async () => "ok",
        guardarSello: async () => {
          guardados += 1;
        },
        sellar: async () => {
          sellos += 1;
          throw new Error("no debería sellar");
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof ErrorSolicitudSello);
      assert.equal(error.status, 403);
      assert.match(error.message, /no es tuya/);
      return true;
    },
  );

  assert.equal(sellos, 0);
  assert.equal(guardados, 0);
});

test("guarda hash, tx_hash y sellado_en igual al verificado_en del hash", async () => {
  const reservas: string[] = [];
  const guardados: SelloGuardado[] = [];
  let entradaSellada: DatosCredencialParaSello | null = null;

  const cuerpo = await procesarSolicitudSello({
    userId: USUARIO,
    body: {
      credencial_id: CREDENCIAL,
      titulo: "Título inventado por el navegador",
      badge_id: "falso",
      emisor: "Nadie",
      estado: "revocada",
    },
    obtenerCredencial: async () => fila(),
    reservarSelladoEn: async (_id, _userId, selladoEn) => {
      reservas.push(selladoEn);
      return "ok";
    },
    guardarSello: async (id, userId, campos) => {
      assert.equal(id, CREDENCIAL);
      assert.equal(userId, USUARIO);
      guardados.push(campos);
    },
    sellar: async (entrada) => {
      entradaSellada = entrada;
      return resultadoDe(entrada);
    },
    ahora: () => new Date(VERIFICADO),
  });

  assert.ok(entradaSellada);
  const sellada = entradaSellada as DatosCredencialParaSello;
  assert.equal(sellada.titulo, "AWS Cloud Practitioner");
  assert.equal(sellada.badge_id, "badge-123");
  assert.equal(sellada.emisor, "Amazon Web Services");
  assert.equal(sellada.estado, "vigente");
  assert.equal(sellada.verificado_en, VERIFICADO);

  assert.deepEqual(reservas, [VERIFICADO]);
  assert.equal(guardados.length, 1);
  const guardado = guardados[0];
  assert.equal(guardado.sellado_en, VERIFICADO);
  assert.equal(guardado.sellado_en, sellada.verificado_en);
  assert.notEqual(guardado.sellado_en, "2026-10-08T23:20:00.000Z");
  assert.equal(guardado.tx_hash, TX);
  assert.equal(guardado.hash, calcularHashSello({ ...sellada, verificado_en: guardado.sellado_en }));

  assert.equal(cuerpo.sellado_en, guardado.sellado_en);
  assert.equal(cuerpo.verificado_en, guardado.sellado_en);
  assert.equal(cuerpo.hash, guardado.hash);
  assert.equal(cuerpo.tx_hash, TX);
});

test("reutiliza el sellado_en ya guardado para no cambiar el hash", async () => {
  let entradaSellada: DatosCredencialParaSello | null = null;
  const guardados: SelloGuardado[] = [];

  await procesarSolicitudSello({
    userId: USUARIO,
    body: { credencial_id: CREDENCIAL },
    obtenerCredencial: async () => fila({ sellado_en: "2026-10-08T23:12:34.567+00:00" }),
    reservarSelladoEn: async () => {
      throw new Error("no debía reservar otro timestamp");
    },
    guardarSello: async (_id, _userId, campos) => {
      guardados.push(campos);
    },
    sellar: async (entrada) => {
      entradaSellada = entrada;
      return resultadoDe(entrada, { ya_existia: true, tx_hash: null });
    },
    ahora: () => {
      throw new Error("no debía generar otro verificado_en");
    },
  });

  assert.ok(entradaSellada);
  const sellada = entradaSellada as DatosCredencialParaSello;
  assert.equal(sellada.verificado_en, VERIFICADO);
  assert.equal(guardados.length, 1);
  assert.equal(guardados[0].sellado_en, VERIFICADO);
  assert.equal(guardados[0].hash, calcularHashSello(sellada));
  assert.equal(guardados[0].tx_hash, null);
});

test("no sella si la credencial no existe, ya está en curso o el hash ya no coincide", async () => {
  let sellos = 0;
  const datos = {
    fuente: "credly",
    badge_id: "badge-123",
    titulo: "AWS Cloud Practitioner",
    emisor: "Amazon Web Services",
    fecha_emision: "2026-10-08",
    estado: "vigente",
    verificado_en: VERIFICADO,
  };

  await assert.rejects(
    () =>
      procesarSolicitudSello({
        userId: USUARIO,
        body: { credencial_id: CREDENCIAL },
        obtenerCredencial: async () => fila(),
        reservarSelladoEn: async () => "ya_reservado",
        guardarSello: async () => {
          throw new Error("no debía guardar");
        },
        sellar: async () => {
          sellos += 1;
          throw new Error("no debía sellar");
        },
        ahora: () => new Date(VERIFICADO),
      }),
    (error: unknown) => {
      assert.ok(error instanceof ErrorSolicitudSello);
      assert.equal(error.status, 409);
      return true;
    },
  );

  await assert.rejects(
    () =>
      procesarSolicitudSello({
        userId: USUARIO,
        body: { credencial_id: CREDENCIAL },
        obtenerCredencial: async () =>
          fila({
            sellado_en: VERIFICADO,
            hash: calcularHashSello(datos),
            titulo: "Título cambiado después del sello",
          }),
        reservarSelladoEn: async () => {
          throw new Error("no debía reservar");
        },
        guardarSello: async () => {
          throw new Error("no debía guardar");
        },
        sellar: async () => {
          sellos += 1;
          throw new Error("no debía sellar");
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof ErrorSolicitudSello);
      assert.equal(error.status, 409);
      return true;
    },
  );

  await assert.rejects(
    () =>
      procesarSolicitudSello({
        userId: USUARIO,
        body: { credencial_id: CREDENCIAL },
        obtenerCredencial: async () => null,
        reservarSelladoEn: async () => "ok",
        guardarSello: async () => {
          throw new Error("no debía guardar");
        },
        sellar: async () => {
          sellos += 1;
          throw new Error("no debía sellar");
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof ErrorSolicitudSello);
      assert.equal(error.status, 404);
      return true;
    },
  );

  assert.equal(sellos, 0);
});

test("no vuelve a sellar si hash, tx_hash y sellado_en ya coinciden", async () => {
  const datos = {
    fuente: "credly",
    badge_id: "badge-123",
    titulo: "AWS Cloud Practitioner",
    emisor: "Amazon Web Services",
    fecha_emision: "2026-10-08",
    estado: "vigente",
    verificado_en: VERIFICADO,
  };
  let sellos = 0;

  const cuerpo = await procesarSolicitudSello({
    userId: USUARIO,
    body: { credencial_id: CREDENCIAL },
    obtenerCredencial: async () =>
      fila({
        sellado_en: VERIFICADO,
        hash: calcularHashSello(datos),
        tx_hash: TX,
      }),
    reservarSelladoEn: async () => "ok",
    guardarSello: async () => {
      throw new Error("no debía reescribir el sello");
    },
    sellar: async () => {
      sellos += 1;
      throw new Error("no debía llamar a la cadena");
    },
  });

  assert.equal(sellos, 0);
  assert.equal(cuerpo.ya_existia, true);
  assert.equal(cuerpo.hash, calcularHashSello(datos));
  assert.equal(cuerpo.sellado_en, VERIFICADO);
  assert.equal(cuerpo.tx_hash, TX);
});
