# Git quickguide

## Skapa en ny feature branch

För att isolera utvecklingen kommer vi använda oss av feature branches när vi utvecklar, så när man ska lägga till något i projektet skapar man en feature branch som man utvecklar den nya funktionaliteten i och när den är testad och klar så mergar vi in den i den primära kodbasen. (Man kan även brancha från branches för större features)

Ståendes i den branch du vill utgå ifrån

    git checkout -b <branch name>

Nu har du skapat en lokal branch på din dator (som är en kopia av den originella branchen), men den är inte ännu synlig för andra på git

Man kan kontrollera att man är i rätt branch med

    git branch

Med commandet

    git push --set-upstream origin <branch name>

görs branchen tillgänglig för andra via git

Nu kan man koda som vanligt i branchen utan att oroa sig över att påverka andras workflow, när featuret är färdigt och testat så mergar man in ändringarna i main.

### För att kunna arbeta i en feature branch som en annan person har skapat

Hämta alla branches som finns tillgängliga på git (kan även fås genom “git pull”, men pull mergar också kodändringar i den branch man står i)

    git fetch

För att se alla brancher (inkluderat de som man inte har lokalt)

    git branch -a

Skapa en lokal kopia av branchen på din dator och byter till den

    git checkout -b <branch name> origin/<branch name>”

## Göra en commit

En av de största anledningarna till att använda git är att det är extremt effektivt för versionshantering så om man råkar ha sönder något, eller helt enkelt vill gå tillbaka och se hur saker fungerade tidigare så kan man lätt gå tillbaka till “checkpoints”, dessa checkpoints skapas då man gör en commit. Det är bättre att committa för ofta än för sällan, men rimligtvis när man t.ex. Skapat en ny funktion eller fixat en bugg, och testat att det verkar fungera.

0.  Hämta de senaste ändringarna i din branch

        git pull

1.  Skriv kod
2.  för att se vilka filer man har ändrat på

        git status

3.  Lägg till de filer man vill committa en ändring på

        git add <filename>

    3.a om man vill reverta ändringar i en fil till senaste commit

        git restore <file>

4.  kontrollera att alla filer är hanterade

        git status

5.  Committa filerna lokalt med en kommentar

        git commit -m “<message>”

    5.a Om man vill spara ändringar i git så alla får tillgång till dem

        git push

## Mergea brancher

Ståendes i den branch man vill merga in i (ex. main)

Säkerställ att man har den senaste versionen av branchen

    git pull

För att initiera mergen

    git merge <branch name>

Har man tur så kommer git automatiskt sköta mergen och man kan enkelt avsluta mergen med att pusha mergen till git

    git push

Om det har skett för mycket förändringar kan det tillkomma en merge conflict

## Merge conflicts

Merge conflicts uppkommer då git inte automatiskt kan kombinera ändringar mellan två brancher, oftast då samma rad har ändrats i båda brancherna, eller om filer har tagits bort och ändrats i olika brancher.

Man kan stöta på merge conflicts då man använder comandsen pull och merge

Vid en merge conflict får man systematiskt gå igenom de filer som har konflikter och välja vilken/vilka rader som ska vara kvar eller ändras (eller helt ny kod). Enklast är att öppna filerna i VScode så får man en liten meny vid varje konflikt där man väljer vilken man ska behålla.

För att se vilka filer som behöver hanteras kan man använda

    git status

När man har löst konflikterna i alla filer lägger man till dem i en commit

    git add <file>

Kontrollerar att alla filer är hanterade

    git status

Commitar mergen

    git commit -m "Resolved merge conflict"

Och pushar upp ändringarna till git

    git push

## Användbara commands

Tar hem och försöker merga ändringar som finns på git till din dator

    git pull

---

Visar status för branchen du står i, exempelvis filer som har ändrats eller filer som är stageade för commits

    git status

---

Stagear en fil för commit, dvs att det som finns i filen på din dator just nu ska vara med i commiten (man kan köra ‘.’ istället för filename för att stagea alla filer som syns med git status, men kontrollera så att inget onödigt kommer med)

    git add <filename>

---

Sparar stageade filer lokalt i en “sparpunkt”

    git commit -m “<commit message>”

---

Skickar upp alla commits man har gjort till git

    git push

---

Hämtar information om branches som finns på git

    git fetch

---

Listar alla branches du har lokalt på din dator (och visar tydligt vilket man står i)

    git branch

---

Listar alla branches som finns på git och lokalt (och visar tydligt vilket man står i)

    git branch -a

---

Byt till en branch som existerar lokalt eller på git (eller skapa en branch med det namnet om det inte finns med -b flaggan)(git switch är typ samma sak)

    git checkout <branch name>
    git checkout -b <branch name>

---

Mergea brancher med varandra

    git merge <branch name>

## .gitignore

I git ligger filen .gitignore som innehåller de filer man vill ha kvar i git mappen, men som man inte vill pusha upp till git av någon anledning. Exempelvis databasfiler, caches etc.
