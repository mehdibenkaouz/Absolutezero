# Flow — pagina e feedback

La pagina presenta la demo reale, il prezzo e le due modalità di installazione su Windows. Le due applicazioni incorporate restano quelle originali; la nuova presentazione usa testi più leggibili e una scena di lavoro illustrativa.

## Immagine

Asset: `images/flow-reception.webp`, creato con il generatore di immagini integrato. Il prompt richiede una reception italiana naturale, una responsabile di circa 54 anni e un collega di circa 40, colori caldi e sobri, e la schermata di pianificazione di Flow sul monitor. La composizione usa la schermata reale come riferimento; la demo e le schermate di prodotto nella pagina rimangono gli originali per leggere l'interfaccia esatta.

La dicitura «Immagine creata con AI» è incorporata nell'immagine in basso a destra e ripetuta nella didascalia accessibile. La scena non rappresenta clienti o testimonianze.

## Invio diretto

`feedback.js` invia il parere a `https://flow-feedback-service.speedybasil5.chatgpt.site/api/feedback`. Non apre la posta e non richiede nome, email o registrazione. Il successo viene mostrato solo quando il servizio restituisce la conferma del salvataggio. Il testo resta disponibile in caso di errore; una chiave di richiesta evita duplicazioni quando si riprova dopo una risposta persa.

Il servizio ammette gli origin HTTPS del dominio mehdi-benkaouz.com (con e senza www) e mehdibenkaouz.github.io. Un eventuale nuovo dominio richiede l'aggiornamento dell'allowlist server. Non inserire chiavi amministrative nei file della pagina.

Il popup usa l'uscita del puntatore verso l'alto dopo 15 secondi di pagina visibile; sui dispositivi touch usa 45 secondi visibili, almeno metà pagina esplorata e un ritorno verso l'alto seguito da una pausa. L'invito automatico compare una volta per sessione e non interrompe video, campi in modifica, altre finestre o la demo a schermo intero. Il link manuale resta disponibile.

## Bacheca privata

https://flow-feedback-bacheca.speedybasil5.chatgpt.site

La bacheca richiede l'accesso ChatGPT ed è pubblicata con il solo proprietario autorizzato. Permette lettura, filtri, aggiornamento, paginazione e archiviazione. Il servizio ricevente e il database sono gestiti separatamente tramite Sites; i segreti sono configurati solo sul server. Il testo dei pareri non viene inviato a GA4. Gli eventi misurano soltanto apertura, chiusura, invio confermato o errore.
