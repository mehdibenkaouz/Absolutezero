# Flow — pagina e feedback

La pagina presenta la demo reale, il prezzo e le due modalità di installazione su Windows. Le due applicazioni incorporate restano quelle originali; la nuova presentazione usa testi più leggibili e una scena di lavoro illustrativa.

## Immagini e presentazione

Tre scene illustrative create con il generatore di immagini integrato, ottimizzate in WebP (1536 × 1024). Le persone non sono clienti, dipendenti reali o testimonianze. La didascalia «Scena creata con AI» è subito sotto ciascuna immagine, leggibile anche con tecnologie assistive, senza coprire la fotografia. Anche il testo alternativo dichiara la natura illustrativa. Non si deduce la provenienza AI delle foto dei competitor dalla sola apparenza.

- `images/flow-reception-v2.webp`: reception di un piccolo albergo italiano, responsabile di circa 54 anni e collega di circa 42 davanti a un PC. Il prompt richiede una sola scrivania rettangolare con piano continuo, bordi e prospettiva coerenti; luce naturale, materiali sobri, anatomia realistica. La schermata reale `screenshots/01-planning.png` è il riferimento per il monitor. La foto rimane illustrativa: per leggere l’interfaccia esatta usare la demo o le schermate reali.
- `images/flow-team.webp`: responsabile di negozio di circa 55 anni e collega di circa 35 che discutono il piano settimanale su carta, al banco, luce naturale e gesti spontanei. Nessun testo promozionale o testimonial nell’immagine.
- `images/flow-employee.webp`: lavoratore nell’ospitalità di circa 45 anni che consulta un telefono durante una pausa, ambiente sobrio, luce dalla finestra, espressione naturale. Il telefono è rivolto alla persona, senza simulare funzionalità del prodotto.

La prima immagine sostituisce la versione con il difetto nel piano del tavolo. Le foto aggiuntive accompagnano casi d’uso distinti. Il riferimento di presentazione è Planday (https://www.planday.com/it): tour di prodotto, persone e settori riconoscibili; nessuna promessa di miglioramento delle conversioni senza misurazioni.

Il layout usa fino a 1520 px sui monitor grandi; i paragrafi mantengono una misura più corta. La demo ha dimensioni proprie (`flex: 0 0 auto`): la precedente combinazione di flex-basis zero e genitore di altezza automatica la comprimeva. Lo schermo intero usa invece lo spazio flessibile residuo. La scelta della demo desktop dipende dalla larghezza, senza escludere i portatili con poca altezza utile. I documenti delle due app incorporate sono invariati.

### Riferimenti per la disclosure AI

Verificati il 18 ottobre 2026: articolo 50(4)–(5) dell’AI Act (https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50) e indicazioni della Commissione (https://digital-strategy.ec.europa.eu/en/policies/eu-icons-labelling-ai-generated-content). L’articolo richiede informazione chiara, distinguibile e accessibile alla prima esposizione quando la disclosure è dovuta; non fissa una misura in pixel. La dicitura resta visibile accanto a ogni scena. Questa scelta non costituisce una verifica legale complessiva del sito.

## Feedback e migrazione indipendente

La bacheca è ora inclusa nel repository, in `flow/bacheca/`. Il servizio autonomo, i test e l’attivazione nel proprio account Cloudflare si trovano in [`services/flow-feedback`](../services/flow-feedback/README.md). La pagina di login è pubblica; il server protegge i messaggi con password e sessioni a scadenza. Il codice e l’archivio operativo, dopo il collegamento, non richiedono ChatGPT.

`feedback.js` legge `feedback-config.js` prima di inviare. Durante il passaggio la configurazione mantiene esplicitamente il precedente ricevitore ChatGPT Sites per evitare interruzioni: il campo `apiBase` vuoto indica che il nuovo Worker non è ancora collegato. Non dichiarare completata la migrazione finché il nuovo archivio non è attivo, i pareri esistenti non sono stati trasferiti e la configurazione aggiornata non è pubblicata. Il comando `npm run connect -- URL` nel servizio verifica il Worker e rimuove la destinazione precedente dalla configurazione.

I visitatori scrivono direttamente senza nome, email o registrazione. Una conferma con lo stesso ID della richiesta indica che il messaggio è stato salvato. Gli errori conservano il testo e permettono il nuovo tentativo senza duplicarlo. Il contenuto dei pareri non viene inviato a GA4.

Il popup automatico mantiene uscita desktop dopo 15 secondi visibili e invito mobile dopo lettura e ritorno verso l’alto; compare una volta per sessione e non interrompe altre finestre, input, video o demo a schermo intero. I link manuali restano disponibili.

### Accessi nel passaggio

- Nuova pagina nel proprio sito: https://www.mehdi-benkaouz.com/Absolutezero/flow/bacheca/
- Vecchia bacheca, da conservare per il recupero dei dati fino al completamento del passaggio: https://flow-feedback-bacheca.speedybasil5.chatgpt.site

Le password si impostano solo nei segreti Cloudflare. Non mettere nel repository credenziali o feedback reali.
