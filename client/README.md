# Front-end
Vi använder HTML, JavaScript och CSS.

## 📁 Filstruktur
Hela hemsidan styrs från `index.html`. Den byter innehåll beroende på vilken sida, såsom **Home, Order, Deliver, Profil, Login** osv, som ska synas. Varje sådan sida har:
- En egen HTML-fil
- En egen JavaScript-fil
- En egen CSS-fil

All front-end-kod finns i `/client`, som har följande struktur:
```
/client
    index.html  # Huvudsidan
    /pages      # HTML-filer för varje sida
    /scripts    # JavaScript-filer (en global + sid-specifika)
    /styles     # CSS-filer (en global + sid-specifika)
    /components # Återanvändbar HTML (t.ex. en order, denna finns inte än)
    /images     # Alla bilder
```

### 📜 **Beskrivning av mappar**

#### 🏠 **Huvudsidan**
- `index.html` – Startsidan. Dubbelklicka på denna i filhanteraren för att se vår webbplats! Denna redirectear direkt till Home sidan. Här finns navbaren, en container och sidfoten. Det är i containern som koden för de olika sidorna som Home, Order, Deliver osv läggs.

#### 📄 **/pages**
Här ligger alla HTML-filer för webbplatsens sidor:
- `home.html`
- `order.html`
- `deliver.html`
- `profile.html`
- `login.html`

#### 🎯 **/scripts**
Varje sida har sin egen JavaScript-fil för funktionalitet:
- `home.js`
- `order.js`
- `deliver.js`
- `profile.js`
- `login.js`

Det finns även en global JavaScript-fil och funktioner i denna nås från alla sidor (eftersom den ligger i `index.html`):
- `global.js`

#### 🎨 **/styles**
Här ligger all CSS för webbplatsen. All CSS som finns återanvänds över flera olika sidor ska ligga i filen `global.css`. Det kan till exemel vara CSS för knappar eller rubriker för att göra dem enhetliga över hela hemsidan. Om en viss CSS är specifik för endast en sida, ska den istället läggas i `{sida}.css`. Detta kan till exempel vara CSS för varukorgen för Order sidan. 

- **`global.css`** – Innehåller gemensamma stilar (t.ex. rubriker, knappar)
- **`{sida}.css`** - För stilar som bara används på en specifik sida (tex `home.css`)

#### 🔄 **/components – Återanvändbara HTML-kod**
Här läggs gemensamma HTML-komponenter som återanvänds på flera sidor eller flera gånger på en sida. Kan till exempel vara en rad för en order under Deliver sidan.

#### 🖼️ **/images – Bilder**
Här läggs alla bilder som används på webbplatsen.

---

## 🚀 **Se hemsidan**
Det finns flera olika sätt att se vår hemsida. Ett sätt är:

1. **Live från VS Code:**
  Ladda mer extension "Live Server" och tryck på "Go Live" längst ner till höger i VS Code.
  **OBS!** Den öppnar sidan du har uppe. Så viktigt att öppna och stå i `index.html` och gå live därifrån.

2. **Från filträder:**
  Dubbelklicka på `index.html` i filträdet. Kan behöva anpassa hosten i `scripts/global.js`. 


> **OBS:** Vi behöver inte starta en server förrän vi kopplar ihop front-end med back-end.
