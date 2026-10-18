# Feedback Flow — codice su GitHub, archivio nel tuo account

Servizio autonomo da ChatGPT: Cloudflare Worker + database D1, con bacheca statica pubblicata dal repository GitHub in `/flow/bacheca/`. Nessuna dipendenza da ChatGPT Sites, account ChatGPT o API OpenAI nel servizio. L’abbonamento ChatGPT non gestisce questa infrastruttura. Restano applicabili i limiti e le condizioni del tuo account Cloudflare.

GitHub Pages pubblica HTML/CSS/JavaScript; l’invio anonimo e la lettura privata dei messaggi richiedono un backend. Le password e i messaggi non si salvano nel repository pubblico.

## Stato del passaggio

Il progetto è pronto per il tuo account Cloudflare. La configurazione pubblica `flow/feedback-config.js` mantiene temporaneamente il servizio precedente mentre il nuovo archivio viene attivato. La bacheca GitHub mostra la configurazione iniziale finché il campo `apiBase` è vuoto. **La migrazione è completa solo dopo attivazione, recupero dei pareri precedenti e pubblicazione del nuovo indirizzo API.** Non disattivare l’archivio precedente prima di questi controlli.

## Attivazione dal repository

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fmehdibenkaouz%2FAbsolutezero%2Ftree%2Fmain%2Fservices%2Fflow-feedback)

1. Apri il pulsante con il tuo account Cloudflare e autorizza il collegamento a GitHub. La procedura può creare una copia del progetto nel tuo account GitHub. Usa la sottocartella `services/flow-feedback` come directory del progetto se ti viene richiesta. Il database dichiarato come `DB` viene predisposto dalla procedura; l’ID tutto zero nel modello è un segnaposto, non un database utilizzabile.
2. Imposta **come segreti del Worker** `ADMIN_PASSWORD` (password unica di almeno 20 caratteri) e `FEEDBACK_SIGNING_KEY` (chiave casuale distinta di almeno 32 caratteri). Il gestore password può generarli. I valori segnaposto del file di esempio sono rifiutati dal servizio. Non inviare i segreti in chat e non aggiungerli al codice.
3. Mantieni il comando di pubblicazione `npm run deploy`, che applica le migrazioni D1 e pubblica il Worker. L’indirizzo finale sarà quello restituito da Cloudflare; non è necessario indovinare un nome `workers.dev`.
4. Prima di cambiare l’indirizzo sul sito, recupera privatamente i feedback del vecchio archivio e importali nel nuovo, mantenendo ID, testo, categoria, stato e data. I dati reali non devono finire in commit, issue o commenti GitHub. `scripts/import-backup.mjs` prepara l’importazione D1 da un file JSON privato; usa `--remote` solo dopo aver verificato l’account e il database di destinazione.
5. Dal checkout del repository esegui:

   ```bash
   cd services/flow-feedback
   npm ci
   npm run connect -- https://INDIRIZZO-RESTITUITO-DA-CLOUDFLARE
   ```

   Il comando verifica salute, migrazioni e CORS del servizio; aggiorna solo `flow/feedback-config.js`, eliminando l’indirizzo ChatGPT dalla configurazione. Il file non contiene password. Rivedilo e pubblicalo su GitHub, oppure comunica soltanto l’URL pubblico del Worker a chi cura il sito per completare il collegamento.
6. Apri `https://www.mehdi-benkaouz.com/Absolutezero/flow/bacheca/`, accedi con la nuova password e verifica un invio reale dal sito. Controlla che i messaggi precedenti ci siano e che una finestra senza accesso non possa leggerli. Soltanto allora disattiva i due servizi precedenti su ChatGPT Sites.

Il campo «Collega il tuo archivio» della bacheca permette anche una verifica in quella finestra; non modifica da solo la destinazione degli invii dei visitatori. Questa distinzione evita di dichiarare completata una migrazione ancora da collegare.

## Installazione con Wrangler, alternativa al pulsante

Richiede Node >=22.13.0 e accesso al tuo account Cloudflare:

```bash
npm ci
npx wrangler login
npx wrangler d1 create flow-feedback
```

Sostituisci `database_id` nel file `wrangler.jsonc` con l’ID restituito dal tuo account, poi imposta i segreti con i prompt nascosti di Wrangler:

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put FEEDBACK_SIGNING_KEY
npm run deploy
```

Per lo sviluppo usa `.dev.vars` locale, escluso da Git. Non riutilizzare credenziali di produzione negli esempi o nei test.

## Accesso e trattamento dei messaggi

- I visitatori inviano un messaggio senza registrazione né email. Solo una ricevuta con il corretto ID conferma il salvataggio.
- La pagina di accesso della bacheca è pubblica. I messaggi, le modifiche di stato e l’archivio sono protetti sul server dalla password e da sessioni di 30 minuti.
- I token di sessione vengono conservati in memoria nella finestra, senza cookie, localStorage o sessionStorage. Nel database si salva soltanto l’hash del token. Esci revoca la sessione; il cambio password invalida quelle precedenti.
- CORS ammette solo i domini HTTPS del sito Flow. Le operazioni amministrative richiedono anche una sessione valida. Il client mostra i messaggi con `textContent`.
- Login: massimo cinque tentativi per IP di trasporto ogni 15 minuti e 25 complessivi per intervallo. Gli IP grezzi non vengono memorizzati nel database: si usano HMAC a rotazione giornaliera.
- Sono conservati i limiti, la challenge firmata, la protezione contro duplicazioni e il campo anti-bot del servizio iniziale. Il testo non viene inviato a GA4. Il codice non scrive messaggi, password o token nei log.
- Per cambiare dominio occorre aggiornare l’allowlist del Worker, la validazione dell’indirizzo nel client e la policy CSP della bacheca.

## Verifiche

```bash
npm test
npm run check
```

I test usano SQLite reale in memoria per le query D1: invio, ricevute, idempotenza, limiti, lettura privata, autenticazione, revoca, scadenza, rotazione password, CORS e errori. I test del modulo pubblico verificano anche la configurazione autonoma e l’assenza di fallback a ChatGPT quando il nuovo servizio è selezionato. Questi controlli non sostituiscono una prova visiva nel browser o il collaudo nel proprio account Cloudflare.

## Riferimenti del fornitore

- GitHub Pages è hosting statico: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- Procedura Cloudflare e creazione risorse: https://developers.cloudflare.com/workers/platform/deploy-buttons/
- Configurazione D1: https://developers.cloudflare.com/workers/wrangler/configuration/#d1-databases
