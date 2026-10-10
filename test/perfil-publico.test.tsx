import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import PerfilPublicoVista from "../src/components/PerfilPublicoVista";
import {
  datosParaComprobar,
  debeMostrarBotonSellar,
  linkTransaccion,
  mapearCredencial,
  soloSelladas,
  tieneSello,
  urlFotoSegura,
  type CredencialVisible,
} from "../src/lib/credencial-publica";

const TX = "0x0d0124f3bed5a03ea655d5e67d0d86db6b466d2bd25403331c40bf4a42e69a1d";

function credencial(parcial: Partial<CredencialVisible> = {}): CredencialVisible {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    fuente: "credly",
    badge_id: "badge-123",
    titulo: "AWS Cloud Practitioner",
    emisor: "Amazon Web Services",
    fecha_emision: "2026-10-08",
    estado: "vigente",
    hash: "0xabc",
    tx_hash: TX,
    sellado_en: "2026-10-08T23:12:34.567+00:00",
    rango: "bronce",
    ...parcial,
  };
}

test("linkTransaccion arma el link de Etherscan de la transacción", () => {
  assert.equal(linkTransaccion(TX), `https://sepolia.etherscan.io/tx/${TX}`);
  assert.equal(
    linkTransaccion("0d0124f3bed5a03ea655d5e67d0d86db6b466d2bd25403331c40bf4a42e69a1d"),
    `https://sepolia.etherscan.io/tx/${TX}`,
  );
  assert.equal(linkTransaccion(null), null);
  assert.equal(linkTransaccion("  "), null);
});

test("solo muestra el botón Sellar si todavía no hay hash", () => {
  assert.equal(tieneSello(credencial()), true);
  assert.equal(debeMostrarBotonSellar(credencial()), false);
  assert.equal(tieneSello(credencial({ hash: null, sellado_en: "2026-10-08T00:00:00.000Z" })), false);
  assert.equal(debeMostrarBotonSellar(credencial({ hash: null })), true);
});

test("datosParaComprobar manda sellado_en para recalcular el hash y omite filas incompletas", () => {
  const datos = datosParaComprobar(credencial());
  assert.ok(datos);
  assert.equal(datos.sellado_en, "2026-10-08T23:12:34.567+00:00");
  assert.equal(datos.fecha_emision, "2026-10-08");
  assert.equal(datosParaComprobar(credencial({ sellado_en: null })), null);
  assert.equal(datosParaComprobar(credencial({ titulo: null })), null);
});

test("mapearCredencial ignora filas sin id y recorta texto vacío", () => {
  assert.equal(mapearCredencial(null), null);
  assert.equal(mapearCredencial({ titulo: "AWS" }), null);
  const mapeada = mapearCredencial({
    id: " 22222222-2222-4222-8222-222222222222 ",
    titulo: "  ",
    hash: "0xabc",
    tx_hash: TX,
  });
  assert.ok(mapeada);
  assert.equal(mapeada.titulo, null);
  assert.equal(mapeada.hash, "0xabc");
});

test("urlFotoSegura solo acepta http(s)", () => {
  assert.equal(urlFotoSegura("https://ejemplo.com/a.png"), "https://ejemplo.com/a.png");
  assert.equal(urlFotoSegura("javascript:alert(1)"), null);
  assert.equal(urlFotoSegura(null), null);
});

test("el perfil público muestra Comprobar sello y el link de la transacción, y oculta lo no sellado", () => {
  const html = renderToStaticMarkup(
    <PerfilPublicoVista
      perfil={{
        nombre: "Ana",
        usuario: "ana",
        foto_url: null,
        descripcion: "Dev",
      }}
      credenciales={[
        credencial(),
        credencial({
          id: "33333333-3333-4333-8333-333333333333",
          titulo: "Insignia sin sello",
          hash: null,
          tx_hash: null,
          sellado_en: null,
        }),
      ]}
    />,
  );

  assert.match(html, /Comprobar sello/);
  assert.match(html, new RegExp(`https://sepolia\\.etherscan\\.io/tx/${TX}`));
  assert.match(html, /AWS Cloud Practitioner/);
  assert.equal(html.includes("Insignia sin sello"), false);
  assert.equal(soloSelladas([credencial({ hash: null })]).length, 0);
});
