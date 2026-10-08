"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { TAGS, venueById } from "@/lib/data";

type NDEFReaderLike = {
  write: (msg: { records: { recordType: string; data?: string }[] }) => Promise<void>;
  scan: () => Promise<void>;
  onreading: ((e: { serialNumber: string; message: { records: { recordType: string; data?: DataView }[] } }) => void) | null;
};

const getOrigin = () => window.location.origin;
const hasWebNfc = () => "NDEFReader" in window;

export default function TagsPage() {
  const origin = useSyncExternalStore(() => () => {}, getOrigin, () => "");
  const nfc = useSyncExternalStore(() => () => {}, hasWebNfc, () => false);
  const [status, setStatus] = useState<string>("");
  const [writing, setWriting] = useState<string | null>(null);

  const reader = () => new (window as unknown as { NDEFReader: new () => NDEFReaderLike }).NDEFReader();

  async function write(id: string) {
    const url = `${origin}/t/${id}`;
    setWriting(id);
    setStatus(`Encoste a tag no celular para gravar ${url}…`);
    try {
      await reader().write({ records: [{ recordType: "url", data: url }] });
      setStatus(`✅ Tag gravada: ${url}`);
    } catch (e) {
      setStatus(`❌ Falhou: ${(e as Error).message}`);
    } finally {
      setWriting(null);
    }
  }

  async function clear() {
    setWriting("__clear__");
    setStatus("Encoste a tag no celular para apagar o conteúdo…");
    try {
      await reader().write({ records: [{ recordType: "empty" }] });
      setStatus("🧹 Tag limpa. Ela está vazia e pronta para ser gravada de novo.");
    } catch (e) {
      setStatus(`❌ Falhou: ${(e as Error).message}`);
    } finally {
      setWriting(null);
    }
  }

  async function scan() {
    try {
      const r = reader();
      await r.scan();
      setStatus("Aproxime uma tag para ler…");
      r.onreading = (e) => {
        const rec = e.message.records.find((x) => x.recordType === "url");
        const url = rec?.data ? new TextDecoder().decode(rec.data) : "(sem URL)";
        setStatus(`📶 Tag ${e.serialNumber}: ${url}`);
      };
    } catch (e) {
      setStatus(`❌ ${(e as Error).message}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Link href="/org" className="text-sm text-[#123b8c]">
        ← Painel
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Tags NFC</h1>
      <p className="mt-1 text-sm text-gray-600">
        Cada tag (NTAG213, 144 bytes) guarda só uma URL curta <code className="rounded bg-gray-100 px-1">/t/&lt;id&gt;</code>. O que ela significa — local, andar,
        acessibilidade — fica no servidor e pode mudar sem regravar a tag.
      </p>

      <div className={`mt-4 rounded-2xl p-4 text-sm ${nfc ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
        {nfc ? (
          <>
            <b>Web NFC disponível.</b> Toque em &quot;Gravar&quot; e encoste a tag nas costas do celular.
            <span className="mt-2 flex flex-wrap gap-2">
              <button onClick={scan} className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                Ler uma tag
              </button>
              <button onClick={clear} disabled={!!writing} className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-50">
                {writing === "__clear__" ? "Aproxime…" : "🧹 Limpar tag"}
              </button>
            </span>
          </>
        ) : (
          <>
            <b>Sem Web NFC neste navegador.</b> Use o Chrome no Android, ou o app <b>NFC Tools</b> (Android/iOS): Escrever → Adicionar registro → URL → cole o link abaixo.
          </>
        )}
        {status && <p className="mt-2 font-mono text-xs">{status}</p>}
      </div>

      <ul className="mt-4 space-y-2">
        {TAGS.map((t) => {
          const url = `${origin}/t/${t.id}`;
          return (
            <li key={t.id} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <b className="block text-sm">{t.label}</b>
                  <span className="text-xs text-gray-500">
                    {t.kind} · {venueById(t.venueId)?.short}
                  </span>
                  <p className="mt-1 break-all font-mono text-[11px] text-gray-600">{url}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  {nfc && (
                    <button onClick={() => write(t.id)} disabled={!!writing} className="rounded-full bg-[#123b8c] px-3 py-1 text-xs font-bold text-white disabled:opacity-50">
                      {writing === t.id ? "Aproxime…" : "Gravar"}
                    </button>
                  )}
                  <button onClick={() => navigator.clipboard.writeText(url).then(() => setStatus(`Copiado: ${url}`))} className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                    Copiar
                  </button>
                  <Link href={`/t/${t.id}`} className="rounded-full bg-gray-100 px-3 py-1 text-center text-xs">
                    Simular
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
