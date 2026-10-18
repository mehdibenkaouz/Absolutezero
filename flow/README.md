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

## Invio diretto

`feedback.js` invia il parere a `https://flow-feedback-service.speedybasil5.chatgpt.site/api/feedback`. Non apre la posta e non richiede nome, email o registrazione. Il successo viene mostrato solo quando il servizio restituisce la conferma del salvataggio. Il testo resta disponibile in caso di errore; una chiave di richiesta evita duplicazioni quando si riprova dopo una risposta persa.

Il servizio ammette gli origin HTTPS del dominio mehdi-benkaouz.com (con e senza www) e mehdibenkaouz.github.io. Un eventuale nuovo dominio richiede l'aggiornamento dell'allowlist server. Non inserire chiavi amministrative nei file della pagina.

Il popup usa l'uscita del puntatore verso l'alto dopo 15 secondi di pagina visibile; sui dispositivi touch usa 45 secondi visibili, almeno metà pagina esplorata e un ritorno verso l'alto seguito da una pausa. L'invito automatico compare una volta per sessione e non interrompe video, campi in modifica, altre finestre o la demo a schermo intero. Il link manuale resta disponibile.

## Bacheca privata

https://flow-feedback-bacheca.speedybasil5.chatgpt.site

La bacheca richiede l'accesso ChatGPT ed è pubblicata con il solo proprietario autorizzato. Permette lettura, filtri, aggiornamento, paginazione e archiviazione. Il servizio ricevente e il database sono gestiti separatamente tramite Sites; i segreti sono configurati solo sul server. Il testo dei pareri non viene inviato a GA4. Gli eventi misurano soltanto apertura, chiusura, invio confermato o errore.
