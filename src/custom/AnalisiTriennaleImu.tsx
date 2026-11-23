// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("AnalisiTriennaleImu");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("AnalisiTriennaleImu");
import { useState } from "react";
import { Card, Select, Badge, useTable, type SectionProps } from "../floware";
function numero(t) {__mk();
 if (!t || !t.trim()) return null;
 const n = Number(t.split(".").join("").replace(",", ".").trim());
 return Number.isFinite(n) && n >= 0 ? n : null;
}
function media(a) {__mk(); return a.reduce((s,v) => (__mk(), s+v),0)/a.length; }
function sintesi(a) {__mk();
 if (!a.length) return "—";
 const b = [...a].sort((x,y) => (__mk(), x-y));
 const m = Math.floor(b.length/2);
 const med = b.length%2 ? b[m] : (b[m-1]+b[m])/2;
 return "media " + Math.round(media(b)) + "; mediana " + Math.round(med) + "; min–max " + Math.round(b[0]) + "–" + Math.round(b[b.length-1]);
}
export default function AnalisiTriennaleImu({pageId}: SectionProps) {__mk();
 const t = useTable(pageId);
 const h = useTable("storico-imu");
 const ref = useTable("consumi-abitativi");
 const [fascia,setFascia] = useState("Tutte");
 const [occupanti,setOccupanti] = useState("Tutti");
 const colonne = ["Fascia superficie","Occupanti","Gas Smc/anno","Elettricità kWh/anno"];
 const storiche = ["Fascia superficie","Occupanti","Gas 2021 Smc","Gas 2022 Smc","Elettricità 2021 kWh","Elettricità 2022 kWh","Periodo"];
 if (!t || !h || colonne.some(c => (__mk(), t.column(c)<0)) || storiche.some(c => (__mk(), h.column(c)<0))) return <Card title="Analisi triennale">Registro o colonne del triennio non disponibili.</Card>;
 function atteso(cat,classe,col) {__mk();
  if (!ref || ["Categoria","Classe o fascia",col].some(c => (__mk(), ref.column(c)<0))) return null;
  const r = ref.rows.find(r => (__mk(), ref.value(r,"Categoria")===cat && ref.value(r,"Classe o fascia")===classe));
  return r ? numero(ref.value(r,col)) : null;
 }
 const dati = t.rows.map((r,i) => {__mk();
  const s = t.value(r,"Fascia superficie");
  const o = t.value(r,"Occupanti");
  const uguali = t.rows.filter(x => (__mk(), t.value(x,"Fascia superficie")===s && t.value(x,"Occupanti")===o));
  const st = h.rows.filter(x => (__mk(), h.value(x,"Fascia superficie")===s && h.value(x,"Occupanti")===o && h.value(x,"Periodo")==="2021–2023"));
  const univoco = uguali.length===1 && st.length===1;
  const g = [univoco ? numero(h.value(st[0],"Gas 2021 Smc")) : null,univoco ? numero(h.value(st[0],"Gas 2022 Smc")) : null,numero(t.value(r,"Gas Smc/anno"))];
  const e = [univoco ? numero(h.value(st[0],"Elettricità 2021 kWh")) : null,univoco ? numero(h.value(st[0],"Elettricità 2022 kWh")) : null,numero(t.value(r,"Elettricità kWh/anno"))];
  const completo = g.every(v => (__mk(), v!==null)) && e.every(v => (__mk(), v!==null));
  const gm = completo ? media(g) : null;
  const em = completo ? media(e) : null;
  const classe = o==="1" ? "1 componente" : o==="5 o più" ? o : o+" componenti";
  const gs = atteso("Superficie",s,"Gas Smc/anno");
  const go = atteso("Componenti",classe,"Gas Smc/anno");
  const es = atteso("Superficie",s,"Elettricità kWh/anno");
  const eo = atteso("Componenti",classe,"Elettricità kWh/anno");
  const confronto = completo && gs>0 && go>0 && es>0 && eo>0;
  return {i,s,o,gm,em,completo,confronto,bg:confronto && gm<0.4*gs && gm<0.4*go,be:confronto && em<0.4*es && em<0.4*eo};
 });
 const f = dati.filter(r => (__mk(), (fascia==="Tutte" || r.s===fascia) && (occupanti==="Tutti" || r.o===occupanti)));
 const v = f.filter(r => (__mk(), r.completo));
 const gruppi = [...new Set(v.map(r => (__mk(), r.o)))].sort();
 return <Card title="Consumi e occupazione · 2021–2023"><div className="space-y-4 text-(--mk-text)">
 <Badge tone="neutral">Simulazioni: nessuna misura reale osservata</Badge>
 <p>Periodo: 2021–2023. Ipotesi: i consumi annuali del registro rappresentano il 2023; quelli 2021 e 2022 sono inventati nella pagina «Storico IMU dimostrativo». Le medie sono elaborazioni della simulazione, non stime di consumi reali.</p>
 <div className="grid gap-3 md:grid-cols-2"><Select label="Fascia superficie" value={fascia} onChange={setFascia} options={["Tutte",...new Set(dati.map(r=>(__mk(), r.s)))]} /><Select label="Occupanti" value={occupanti} onChange={setOccupanti} options={["Tutti",...new Set(dati.map(r=>(__mk(), r.o)))]} /></div>
 <p>Copertura filtrata: {v.length}/{f.length} abitazioni con sei valori validi; escluse {f.length-v.length}. Registro: {dati.length} righe, non le 810 unità degli indicatori. Collegamento storico per fascia e occupanti: combinazioni duplicate o mancanti sono escluse, senza imputazione.</p>
 <p>Medie annue per abitazione sul triennio. Gas (Smc): {sintesi(v.map(r=>(__mk(), r.gm)))}. Elettricità (kWh): {sintesi(v.map(r=>(__mk(), r.em)))}.</p>
 <h3 className="font-semibold">Confronto per numerosità nel filtro selezionato</h3>
 {gruppi.map(o => {__mk();const a=v.filter(r=>(__mk(), r.o===o)); return <p key={o}>Occupanti {o} · n={a.length} · Gas: {sintesi(a.map(r=>(__mk(), r.gm)))}. Elettricità: {sintesi(a.map(r=>(__mk(), r.em)))}.</p>;})}
 <h3 className="font-semibold">Indicatori esplorativi per abitazione</h3>
 {f.map(r=>(__mk(), <p key={r.i}>Riga {r.i+1} · {r.s} · occupanti {r.o}: {!r.completo ? "triennio incompleto o collegamento ambiguo" : !r.confronto ? "riferimenti mancanti" : r.bg || r.be ? "consumi particolarmente bassi da approfondire: " + (r.bg ? "gas " : "") + (r.be ? "elettricità" : "") : "nessun consumo sotto soglia; occupazione continuativa non accertabile"}.</p>))}
 <h3 className="font-semibold">Criteri e limiti</h3>
 <p>Soglia ipotetica non validata: media triennale sotto il 40% di entrambi i riferimenti, per superficie e per occupanti, separatamente per utenza. Riferimenti simulati dalla pagina «Consumi per abitazione»: non sono percentili né un modello congiunto.</p>
 <p>Tre anni attenuano oscillazioni annuali, ma non correggono il clima. Mancano gradi-giorno, impianti, autoconsumo, altre fonti energetiche, continuità delle forniture e variazioni dei residenti. Consumi bassi non provano mancata occupazione; consumi maggiori non provano presenza continuativa.</p>
 <p>Campione minimo e non rappresentativo: nessuna inferenza comunale o decisione tributaria individuale. Confrontare i nuclei anche entro la stessa fascia; differenze residue non sono effetti causali. «5 o più» non significa cinque persone. Questa vista serve a progettare raccolte dati e analisi aggregate per politiche abitative, non accertamenti.</p>
 </div></Card>;
}
