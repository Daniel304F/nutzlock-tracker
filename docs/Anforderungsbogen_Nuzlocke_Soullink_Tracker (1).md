# Anforderungsbogen: Nuzlocke- & Soullink-Tracker (Web-Applikation)

**Dokumenttyp:** Lasten-/Anforderungsspezifikation
**Version:** 1.4 (Entwurf)
**Zielsystem:** Browserbasierte Single-Page-Application (Desktop & Mobile)

> **Änderungen ggü. 1.3:** Randomizer-Settings als **Datei-Upload** (`.rnqs` o. ä.) statt manueller Optionsfelder, inkl. Extraktion lesbarer Metadaten und Teilen im Raum (OP-C → E-8, FR-48/48a); Tod-Propagation in Mehrfach-Links als **konfigurierbare Klausel** mit Default „vollständig" (OP-D → E-9, FR-24a); **Backend-Entscheidung** auf eigenes Backend (FastAPI + SQLite + WebSockets/SSE) festgelegt (OP-E → E-10).
> **Änderungen ggü. 1.2:** Raum-Identität über **UUID**; optionaler **Raum-Passwortschutz** mit **E-Mail-Reset**; Persistenz präzisiert (JSON-Import/-Export plus serverseitige Datenhaltung, z. B. SQLite); Abgrenzung Persistenz vs. Echtzeit-Sync (E-7); NFR-10 angepasst.
> **Änderungen ggü. 1.1:** Mobile Nutzung verbindlich als vollwertige **Handyansicht im Browser**; **Raum-/Session-Konzept** eingeführt.
> **Änderungen ggü. 1.0:** Randomizer-Modus, PokéAPI-Referenzdaten, Auflösung der ursprünglichen offenen Punkte, n-fähiger Link.
> **Änderungen ggü. 1.0:** Randomizer als eigenständiger, kombinierbarer Modus ergänzt (Abschnitt 4.11); Referenzdaten/Sprites über PokéAPI spezifiziert (Abschnitt 4.12); offene Punkte OP-1, OP-2, OP-3, OP-5 entschieden und OP-4 mit Empfehlung versehen (Abschnitt 10); Triple-/Mehrspieler-Link aus dem Ausschluss in die architektonische Berücksichtigung überführt.

---

## 1. Zweck und Geltungsbereich

Die Applikation dient dem **Tracken und Verwalten von selbstauferlegten Pokémon-Challenges**. Unterstützt werden zwei **Challenge-Modi** — *Nuzlocke* (Solo, ein Spieler) und *Soullink* (kooperativ, zwei oder mehr Spieler) — sowie der orthogonal kombinierbare **Randomizer-Modus**, der mit beiden Challenge-Modi kombiniert werden kann. Daraus ergeben sich u. a. die Kombinationen *Standard-Nuzlocke*, *Solo-Randomizer-Nuzlocke*, *Standard-Soullink* und *Randomizer-Soullink*. Die Applikation ersetzt die heute übliche manuelle Verwaltung über Notizzettel, Tabellenkalkulationen oder Drittanbieter-Spreadsheets durch ein zustandsbehaftetes, regelbewusstes System.

Die Applikation soll:
- den **Lebenszyklus** jedes gefangenen Pokémon abbilden (Fang → aktiv → tot/freigelassen),
- **Regelverstöße erkennen** und visuell hervorheben,
- bei Soullink-Runs den Zustand **zwischen zwei Spielern in Echtzeit synchronisieren**,
- den Spielfortschritt dokumentieren und auswertbar machen.

**Nicht im Geltungsbereich** (siehe Abschnitt 9): Emulation des eigentlichen Spiels, automatisches Auslesen des Spielzustands aus dem ROM/Emulator, vollständige Pokédex-/Movesets-Strategiedatenbank.

---

## 2. Glossar

| Begriff | Definition |
|---|---|
| **Run / Challenge** | Eine konkrete Spieldurchführung mit einem definierten Regelwerk und Editionsbezug. |
| **Encounter** | Die erste Begegnung des Spielers in einem definierten Gebiet (Route, Höhle, Stadt). Maßgeblich für die Fangregel. |
| **Tod (Death/Faint)** | Ein Pokémon, das in einem Kampf besiegt wird, gilt als „tot" und darf nicht weiter verwendet werden. |
| **Friedhof (Graveyard)** | Liste aller toten/freigelassenen Pokémon eines Runs. |
| **Klausel (Clause)** | Optionale Zusatz- oder Ausnahmeregel, die das Standardregelwerk modifiziert (z. B. Dupes-Klausel, Shiny-Klausel). |
| **Level-Cap** | Obergrenze für das Level der eigenen Pokémon, üblicherweise gebunden an das höchste Level des nächsten Arenaleiters. |
| **Soullink** | Kooperative Variante: Zwei (oder mehr) Spieler spielen parallel; pro Gebiet gefangene Pokémon werden zu „Seelen-Paaren" (bzw. -Gruppen) verknüpft. |
| **Link / Paar** | Verbindung zweier (oder mehrerer) Pokémon — je eines pro Spieler — die im selben Gebiet gefangen wurden. |
| **Tod-Propagation** | Stirbt ein Pokémon eines Links, gilt automatisch auch sein Partner (bzw. die ganze Link-Gruppe) als tot. |
| **Team-Synchronität** | Ein Pokémon darf nur eingesetzt werden, wenn sein verlinkter Partner ebenfalls lebt und einsatzbereit ist. |
| **Randomizer** | Spielmodus, bei dem Spielinhalte (insb. wilde Begegnungen, oft auch statische/Geschenk-Pokémon, Entwicklungen, Movesets) zufällig vertauscht sind. Die Spezies eines Encounters steht erst zur Laufzeit fest. |
| **Sitzung / Präsenz** | Flüchtiger Verbindungs-/Online-Zustand eines Teilnehmers (nicht persistent). Abzugrenzen vom persistenten *Run*. |
| **Raum (Room)** | Nutzerseitige, persistente Zugangsschicht zu einem gemeinsam gespielten Run. Ein Raum bündelt die teilnehmenden Spieler:innen unter einem Beitritts-Code/-Link und bildet den Einstiegspunkt für den geteilten Zugriff (vor allem bei Soullink). |
| **Referenzdaten** | Statische Stammdaten zu Pokémon, Typen, Editionen und Gebieten (Quelle: PokéAPI), abzugrenzen vom veränderlichen Run-Zustand. |

---

## 3. Akteure / Rollen

- **Spieler (Solo):** Erstellt und verwaltet eigene Nuzlocke-Runs.
- **Spieler A / Spieler B (Soullink):** Gleichberechtigte Teilnehmer eines kooperativen Runs mit geteiltem Zustand.
- **Gast / Zuschauer (optional):** Read-only-Zugriff auf einen geteilten Run (z. B. für Streaming/Übersicht).
- **System:** Validiert Regeln, propagiert Zustände, synchronisiert zwischen Clients.

---

## 4. Funktionale Anforderungen

### 4.1 Run-/Challenge-Verwaltung

- **FR-1** Der Nutzer kann einen neuen Run anlegen mit: Name, Challenge-Modus (*Nuzlocke* / *Soullink*), **Randomizer-Flag** (an/aus, frei mit dem Challenge-Modus kombinierbar) und Pokémon-Edition/Generation.
- **FR-2** Der Nutzer kann mehrere Runs parallel führen und zwischen ihnen wechseln; jeder Run hält seinen Zustand unabhängig.
- **FR-3** Ein Run besitzt einen Status: *aktiv*, *abgeschlossen (Sieg)*, *gescheitert (Wipeout)*, *archiviert*.
- **FR-4** Ein Run kann umbenannt, archiviert, dupliziert (als Vorlage) und gelöscht werden. Vor dem Löschen erfolgt eine Bestätigungsabfrage.
- **FR-5** Zu jedem Run können Metadaten hinterlegt werden (Freitext-Notizen); bei aktivem Randomizer zusätzlich Seed und verwendete Randomizer-Optionen (siehe Abschnitt 4.11).

### 4.2 Regelwerk-Konfiguration

- **FR-6** Beim Anlegen eines Runs wählt der Nutzer ein Standard-Regelwerk und kann einzelne Klauseln aktivieren/deaktivieren. Mindestens unterstützt:
  - **Fangregel:** Nur das erste Pokémon pro Gebiet darf gefangen werden.
  - **Todesregel:** Besiegte Pokémon gelten als tot und sind nicht weiter einsetzbar.
  - **Nickname-Pflicht** (Hinweis/Vorgabe, nicht erzwungen).
  - **Dupes-Klausel:** Ist die erste Begegnung eine bereits gefangene Spezies, darf erneut begegnet werden.
  - **Shiny-Klausel:** Schillernde Pokémon sind von Fang-/Todesregeln ausgenommen.
  - **Spezies-Klausel:** Pro Spezies darf nur ein Exemplar im Team aktiv sein.
  - **Gift-/Statische-Encounter-Regelung:** Konfigurierbar, ob Geschenk- und statische Begegnungen als Gebiets-Encounter zählen.
  - **Level-Cap-Regel:** Aktivierbar inkl. Quelle (manuell oder an Arenaleiter gekoppelt).
  - **Tod-Propagations-Klausel (Soullink):** Steuert das Verhalten bei Mehrfach-Links (FR-23a). Default: vollständige Propagation (Tod eines Mitglieds → alle Mitglieder tot); alternativ abweichende Hausregeln.
  - **Kampfstil:** Set / Shift (dokumentarisch).
  - **Item-Verbot im Kampf** (dokumentarisch).
- **FR-7** Der Nutzer kann **eigene, frei benannte Klauseln** als Freitext-Hausregeln hinzufügen.
- **FR-8** Aktivierte Klauseln beeinflussen die Validierungslogik des Systems (z. B. erlaubt die Dupes-Klausel einen erneuten Encounter-Eintrag für dasselbe Gebiet).
- **FR-9** Das Regelwerk eines laufenden Runs ist einsehbar; nachträgliche Änderungen werden protokolliert (Änderungsverlauf).

### 4.3 Encounter-Tracking

- **FR-10** Pro Run existiert eine **gebietsbasierte Encounter-Liste**, vorbefüllt anhand der gewählten Edition (Routen, Höhlen, Städte in spielnaher Reihenfolge). Vorbefüllte Routendaten werden für **alle Editionen aller Generationen** bereitgestellt, abgeleitet aus den Referenzdaten (siehe Abschnitt 4.12, `location-area`/`location`-Endpunkte der PokéAPI).
- **FR-11** Zu jedem Gebiet kann der Nutzer einen Encounter erfassen mit: Spezies, Spitzname, Status (*gefangen*, *fehlgeschlagen/geflüchtet*, *getötet vor Fang*, *verpasst*, *Dupe übersprungen*), optional Level, Geschlecht, Wesen, Fähigkeit.
- **FR-12** Das System verhindert (bzw. warnt bei) einen **zweiten gültigen Encounter** im selben Gebiet, sofern keine Dupes-/Sonderklausel greift.
- **FR-13** Gebiete können manuell hinzugefügt, umbenannt und in der Reihenfolge angepasst werden (für Editionen ohne vorbefüllte Daten oder Randomizer).
- **FR-14** Eine Übersicht zeigt pro Gebiet auf einen Blick: Encounter-Status, gefangenes Pokémon und (bei Soullink) das Partner-Pokémon.
- **FR-15** Encounter-Einträge sind editierbar und löschbar; Korrekturen aktualisieren abhängige Zustände (z. B. Roster).

### 4.4 Pokémon-Bestandsverwaltung

- **FR-16** Jedes gefangene Pokémon ist eine verwaltbare Entität mit: Spezies, Spitzname, Herkunftsgebiet, aktuelles Level, Status, Geschlecht, Wesen, Fähigkeit, optionale Attacken und Notizen.
- **FR-17** Das System gruppiert Pokémon in **Team** (aktive Party, max. 6), **Box** (lagernd, lebend) und **Friedhof** (tot/freigelassen).
- **FR-18** Pokémon können zwischen Team und Box verschoben werden; die Team-Grenze von 6 wird durchgesetzt.
- **FR-19** Ein Statuswechsel zu *tot* verschiebt das Pokémon in den Friedhof, entfernt es aus dem Team und sperrt es für weitere Verwendung. Es bleibt mit Todesdatum/Spielkontext archiviert.
- **FR-20** Der Friedhof zeigt alle verlorenen Pokémon mit Spitzname, Spezies, Herkunft, „Lebensdauer" (Fang- bis Todeszeitpunkt im Spielverlauf) und optionaler Todesursache (Freitext).
- **FR-21** Die Anzeige der Spezies erfolgt mit Sprite/Icon und Typ-Information aus den Referenzdaten (siehe Abschnitt 4.12). Sprites werden zwischengespeichert bzw. selbst gehostet, sodass die Anzeige nicht von jedem Live-Abruf abhängt.

### 4.5 Soullink-spezifische Anforderungen

- **FR-22** Bei einem Soullink-Run werden Pokémon, die von Spieler A und Spieler B im **selben Gebiet** gefangen wurden, automatisch zu einem **Link-Paar** verknüpft.
- **FR-23** **Tod-Propagation:** Wird ein Pokémon eines Paares als tot markiert, markiert das System automatisch auch dessen verlinkten Partner als tot (mit klarer Anzeige der Ursache „Partner-Tod").
- **FR-23a** Bei Links mit **mehr als zwei** Mitgliedern (Triple-/n-Link, FR-27a) gilt die Propagation standardmäßig **vollständig**: Stirbt ein Mitglied, sterben alle übrigen Mitglieder des Links. Dieses Verhalten ist über eine **Klausel konfigurierbar** (siehe FR-6), z. B. „vollständige Propagation" (Default) vs. abweichende Hausregeln; der Default bleibt vollständige Propagation.
- **FR-24** **Team-Synchronität:** Das System validiert, dass nur Pokémon im Team sind, deren Partner ebenfalls lebt und im Team des anderen Spielers steht. Verstöße werden als Warnung angezeigt.
- **FR-25** **Soullink-Spezies-Klausel:** Optional erzwingbar — ein Spieler darf in einem Gebiet keine Spezies fangen, die bereits (vom selben oder anderen Spieler) gefangen wurde; das System weist darauf hin.
- **FR-26** Die Soullink-Übersicht zeigt **paarweise nebeneinander** die Pokémon beider Spieler je Gebiet inkl. gemeinsamem Link-Status (*beide leben*, *Paar tot*, *unvollständig*).
- **FR-27** Ist ein Link unvollständig (ein Spieler hat noch keinen Encounter im Gebiet eingetragen), wird dies eindeutig markiert und blockiert keine fehlerhafte Verknüpfung.
- **FR-27a** Das Link-Konzept ist so modelliert, dass ein Gebiets-Link **mehr als zwei** Pokémon umfassen kann (Triple-Link / n-Spieler). Tod-Propagation und Team-Synchronität gelten dann für alle Mitglieder der Link-Gruppe. (v1 kann die UI auf zwei Spieler beschränken; das Datenmodell bleibt n-fähig — siehe OP-5.)

### 4.6 Mehrspieler- und Synchronisationsanforderungen

- **FR-28** Ein Soullink-Run wird innerhalb eines **Raums** gespielt. Der erstellende Spieler legt mit dem Run zugleich einen Raum an; weitere Spieler:innen treten dem Raum über einen **Beitritts-Code oder -Link** bei und erhalten damit Lese-/Schreibzugriff auf den gemeinsamen Run.
- **FR-28a** Der Raum verwaltet die **Mitgliedschaft** zweier (perspektivisch n) gleichberechtigter Spieler:innen. Sichtbar sind die beigetretenen Mitglieder; der Ersteller kann den Beitritts-Code (neu) generieren bzw. invalidieren und Mitglieder entfernen.
- **FR-28b** Der Raum ist die **persistente Zugangsschicht** zum Run: Nach erstmaligem Beitritt bleibt die Mitgliedschaft erhalten, sodass beide Spieler:innen den Raum von ihrem jeweiligen Gerät jederzeit erneut betreten können, ohne den Code erneut einzulösen.
- **FR-28c** Jeder Raum besitzt eine **eindeutige, nicht erratbare UUID**, über die er geräteunabhängig wiedergefunden werden kann (z. B. via Raum-Link, der die UUID enthält). Dies ermöglicht den Wiedereinstieg nach Gerätewechsel oder Verlust des lokalen Caches, ohne Konto.
- **FR-28d** Ein Raum kann durch ein **optionales Passwort** geschützt werden, das beim Erstellen vergeben wird und bei (erneutem) Beitritt abgefragt wird. So ist der Zugriff trotz öffentlich teilbarer UUID/Link kontrollierbar.
- **FR-28e** Wird das Raum-Passwort vergessen, kann es über eine **beim Erstellen optional hinterlegte E-Mail-Adresse zurückgesetzt** werden (Reset-Link/-Code an diese Adresse). Ohne hinterlegte E-Mail ist kein Passwort-Reset möglich (der Nutzer ist hierauf bei der Erstellung hinzuweisen).
- **FR-29** Änderungen eines Spielers (Encounter, Statuswechsel, Team-Änderung) werden dem anderen Spieler **nahezu in Echtzeit** angezeigt.
- **FR-30** Das System behandelt konkurrierende Änderungen konsistent über **Datenpartitionierung**: Jeder Teilnehmer schreibt primär in seinen eigenen Datenbereich (eigene Encounter/Pokémon), wodurch echte Schreibkonflikte vermieden werden. Für *unabhängige* Felder genügt feldbasiertes „last-write-wins" ohne gegenseitiges Überschreiben.
- **FR-30a** *Abgeleitete bzw. geteilte* Zustände (Link-Erzeugung, Tod-Propagation, Meilensteine) werden **atomar** verarbeitet — vorzugsweise serverseitig als einzige Quelle der Wahrheit (z. B. durch eine getriggerte Server-Funktion), sodass kein Client mit einem anderen um die Propagation konkurriert.
- **FR-31** Beide Spieler:innen sehen, ob das jeweils andere Raum-Mitglied gerade online/aktiv ist (Präsenzanzeige, optional).
- **FR-32** Ein Raum kann einen separaten **Read-only-Freigabelink** für Zuschauer:innen bereitstellen (z. B. für Streaming) — ohne Schreibrechte und ohne Raum-Mitgliedschaft.
- **FR-32a** Innerhalb eines Raums haben alle beigetretenen Spieler:innen **gleichberechtigten Schreibzugriff** auf den gemeinsamen Run; jede:r pflegt primär den eigenen Datenbereich (vgl. FR-30), sieht aber den vollständigen geteilten Zustand.

### 4.7 Fortschritt, Level-Cap & Meilensteine

- **FR-33** Der Nutzer kann den Spielfortschritt anhand von **Meilensteinen** (Arenaleiter, Top 4, Story-Punkte) der Edition abbilden und als erreicht markieren.
- **FR-34** Bei aktiver Level-Cap-Regel zeigt das System das aktuelle Cap und warnt, wenn ein Pokémon im Team das Cap überschreitet.
- **FR-35** Eine Badge-/Fortschrittsleiste visualisiert den Stand im Run.

### 4.8 Statistiken und Verlauf

- **FR-36** Pro Run werden Kennzahlen bereitgestellt: Anzahl Encounter (gesamt/erfolgreich/fehlgeschlagen), aktuelle Teamstärke, Anzahl Tode, längste „überlebende" Linie, häufigste Todesursachen.
- **FR-37** Ein **chronologisches Logbuch** protokolliert relevante Ereignisse (Fang, Tod, Team-Wechsel, Meilenstein) mit Zeit-/Spielbezug.
- **FR-38** Bei Soullink zusätzlich: Anzahl intakter Paare vs. verlorener Paare.

### 4.9 Import / Export / Persistenz

- **FR-39** Ein Run kann vollständig als **JSON-Datei exportiert und wieder importiert** werden (Sicherung, Übertragung zwischen Geräten, Archivierung). Das Exportformat ist versioniert und umfasst Run, Regelwerk, Gebiete/Encounter, Pokémon, Links, Meilensteine und Logbuch. Der Reimport stellt den Run vollständig wieder her.
- **FR-39a** Der Export dient als geräteunabhängiges Backup und ergänzt die Raum-UUID (FR-28c) als zweiten, dateibasierten Wiederherstellungsweg.
- **FR-40** Der Zustand wird **automatisch und dauerhaft serverseitig persistiert** (z. B. in einer SQLite-Datenbank als zentraler Datenspeicher), sodass er nicht vom lokalen Cache eines einzelnen Geräts abhängt und beide Raum-Mitglieder denselben aktuellen Stand vorfinden. Bei Neuladen der Seite bleibt der letzte Stand erhalten.
- **FR-40a** **Abgrenzung Persistenz ↔ Echtzeit-Sync:** Die serverseitige Datenhaltung (FR-40) und der dateibasierte Export (FR-39) sichern und speichern die Daten; der *Mehrspieler-Echtzeitabgleich* (FR-29) ist ein davon getrennter Mechanismus auf demselben geteilten Datenspeicher. Ein rein lokaler Speicher allein erfüllt die Soullink-Sync-Anforderung nicht (siehe E-7).
- **FR-41** Optional: Export einer **Zusammenfassung/Übersicht** als teilbares Bild oder PDF (z. B. Friedhof + Team) für Social-Media/Stream.

### 4.10 Benachrichtigungen & Regelvalidierung

- **FR-42** Das System zeigt **kontextbezogene Warnungen** bei potenziellen Regelverstößen (zweiter Encounter, Level-Cap-Überschreitung, Team-Synchronitätsverletzung), ohne die Aktion zwingend zu blockieren (Nutzer behält Hoheit, „Soft-Validation").
- **FR-43** Beim Markieren eines Todes erfolgt eine Bestätigungsabfrage, da der Vorgang weitreichende (und bei Soullink propagierende) Folgen hat.

### 4.11 Randomizer-Modus

- **FR-44** Der Randomizer-Modus ist ein **Flag**, das mit *Nuzlocke* (Solo) wie auch *Soullink* (kooperativ) kombiniert werden kann. Die Kernlogik (Fang-, Todes-, Link-Regeln) bleibt identisch.
- **FR-45** Bei aktivem Randomizer ist die **Spezies eines Encounters nicht vorbestimmt**: Die gebietsbasierte Liste (FR-10) liefert weiterhin die *Gebiete* in spielnaher Reihenfolge, die gefangene Spezies wird jedoch vom Nutzer frei aus den Referenzdaten gewählt (jede Spezies ist potenziell möglich, inkl. Legendären/Starter).
- **FR-46** Die **Spezies-Auswahl** (FR-11) erlaubt im Randomizer-Modus die volle Bandbreite des Pokédex unabhängig davon, welche Spezies in der jeweiligen Edition „natürlich" vorkommen.
- **FR-47** Optional konfigurierbar: ob auch **statische Begegnungen, Geschenk-Pokémon und Tausch** als reguläre Gebiets-Encounter zählen (im Randomizer häufig ebenfalls randomisiert).
- **FR-48** Der Nutzer kann die verwendeten **Randomizer-Einstellungen als Settings-Datei hochladen** (z. B. `.rnqs` des Universal Pokémon Randomizer). Die Datei wird dem Run zugeordnet und gespeichert. Das System extrahiert und zeigt die **trivial lesbaren Metadaten** (z. B. Tool-/Format-Version, ROM-/Spielname) an; eine vollständige Dekodierung des herstellerspezifischen Einstellungs-Bitfelds ist ausdrücklich **nicht** erforderlich. Ergänzend steht ein freies Notizfeld (Seed, Klartext-Anmerkungen) bereit. Diese Angaben sind dokumentarisch und beeinflussen die Validierung nicht.
- **FR-48a** Bei einem Soullink-Run kann die hochgeladene Settings-Datei **im Raum geteilt** werden, sodass beide Spieler:innen mit identischen Randomizer-Einstellungen (und Seed) randomisieren können — Voraussetzung für zueinander passende Encounter-Pools. Beide Mitglieder können die Datei herunterladen.
- **FR-49** Die **Dupes-Klausel** ist im Randomizer-Kontext besonders relevant und standardmäßig aktivierbar; ihre Wirkung (erneuter Encounter bei bereits gefangener Spezies) gilt unverändert.
- **FR-50** Optionales Feld pro Pokémon für eine **abweichende/zufällige Typ- oder Entwicklungsinfo**, falls der Randomizer diese verändert hat (überschreibt für die Anzeige die Referenzdaten, ohne sie zu mutieren).

### 4.12 Referenzdaten, Sprites & externe API

- **FR-51** Stammdaten (Spezies, Typen, Editionen, Gebiete/Routen, Sprites) werden aus einer **öffentlich verfügbaren API** bezogen. Vorgesehene Quelle: **PokéAPI** (`pokeapi.co`, REST). Sprite-Bilddateien stammen aus dem zugehörigen, unter **CC0** stehenden Repository `PokeAPI/sprites`.
- **FR-52** Referenzdaten werden **zwischengespeichert** (clientseitiger Cache und/oder eigene Datenhaltung), sodass wiederholte Abrufe vermieden werden und die App weitgehend ohne Live-Abruf funktioniert.
- **FR-53** Sprites werden **selbst gehostet oder dauerhaft gecacht** statt bei jedem Aufruf direkt von der externen Quelle geladen, um deren Fair-Use-Policy einzuhalten und Ladezeiten zu verbessern (siehe NFR-14).
- **FR-54** Fällt die externe Quelle aus, bleibt die App mit den gecachten Referenzdaten funktionsfähig; lediglich noch nicht zwischengespeicherte, neue Inhalte sind ggf. nicht verfügbar (graceful degradation).
- **FR-55** Die Abbildung „Editions-/Generationsname → API-Bezeichner" ist als pflegbare Konfiguration hinterlegt (vgl. NFR-12), damit neue Editionen ergänzbar sind, sobald die Quelle sie bereitstellt.

### 4.13 Mobile Nutzung (Handyansicht im Browser)

- **FR-56** Die Applikation ist so umgesetzt, dass die **mobile Nutzung vollwertig über die Handyansicht im Browser** erfüllt wird; ein separates natives App-Paket (App Store / Play Store) ist dafür **nicht erforderlich**.
- **FR-57** Der **gesamte Funktionsumfang** (Run-/Raum-Verwaltung, Encounter-Erfassung, Statuswechsel, Team-/Box-/Friedhof-Verwaltung, Soullink-Übersicht) ist auf dem Smartphone bedien- und nutzbar — nicht nur lesend.
- **FR-58** Das Layout ist **adaptiv**: Mehrspaltige Soullink-Paaransichten (FR-26) werden auf schmalen Viewports sinnvoll umgebrochen/gestapelt, ohne dass der Link-Bezug verloren geht.
- **FR-59** Bedienelemente sind **touch-optimiert** (ausreichend große Tap-Ziele, daumenfreundliche Platzierung häufiger Aktionen wie „Encounter eintragen" / „als tot markieren").
- **FR-60** Optional (Could): Bereitstellung als **installierbare Web-App (PWA)** mit Startbildschirm-Icon und Offline-Fähigkeit für Solo-Runs (vgl. NFR-6), als Mittelweg zwischen reiner Webseite und nativer App — ohne App-Store-Distribution.

---

## 5. Nicht-funktionale Anforderungen

### 5.1 Benutzbarkeit & Oberfläche
- **NFR-1** Vollständig **responsive** Bedienung; die mobile Nutzung ist als **vollwertige Handyansicht im Browser** zu erfüllen (gleichwertig zur Desktop-Nutzung, vgl. FR-56–59). Die Encounter-Erfassung muss auf dem Handy mit wenigen Taps möglich sein (relevant für Spielen am TV mit Handy daneben).
- **NFR-2** Schnelles Erfassen eines Encounters in maximal wenigen Interaktionsschritten; Spezies-Auswahl mit Autovervollständigung/Suche.
- **NFR-3** Klare visuelle Statuskodierung (lebend / tot / Box) über Farbe **und** Symbol (nicht ausschließlich Farbe).

### 5.2 Performance
- **NFR-4** Sichtbare Zustandsänderungen reagieren wahrnehmbar verzögerungsfrei; Soullink-Synchronisation idealerweise unter ~1 Sekunde Latenz.
- **NFR-5** Die Anwendung bleibt auch bei mehreren hundert Encounter-/Pokémon-Einträgen pro Run flüssig.

### 5.3 Verfügbarkeit & Offline
- **NFR-6** Solo-Runs sollten auch ohne stabile Internetverbindung nutzbar sein (lokale Persistenz, spätere Synchronisation optional).
- **NFR-7** Verbindungsabbrüche im Soullink-Modus dürfen nicht zu Datenverlust führen; nach Reconnect erfolgt Resynchronisation.

### 5.4 Datenhaltung & Sicherheit
- **NFR-8** Jeder Nutzer hat ausschließlich Zugriff auf eigene Runs bzw. Räume, denen er beigetreten ist.
- **NFR-9** Beitritts-Codes, Raum-UUIDs und Read-only-Links sind **ausreichend zufällig und nicht erratbar**.
- **NFR-9a** Raum-Passwörter (FR-28d) werden **niemals im Klartext** gespeichert, sondern nur als sicherer Hash (mit Salt). Reset-Token (FR-28e) sind kurzlebig und einmalig verwendbar.
- **NFR-10** Es werden nur die für die Funktion notwendigen Daten erhoben (**Datensparsamkeit**). Die einzige optional personenbezogene Angabe ist die **freiwillige E-Mail-Adresse für den Passwort-Reset** (FR-28e); sie ist nicht verpflichtend, wird ausschließlich zu diesem Zweck verwendet und ist auf Wunsch löschbar. Auf die DSGVO-konforme Behandlung (Zweckbindung, Löschbarkeit, Hinweis) ist zu achten.

### 5.5 Kompatibilität
- **NFR-11** Lauffähig in aktuellen gängigen Browsern (Chromium-basiert, Firefox, Safari) ohne Installation.

### 5.6 Erweiterbarkeit & Wartbarkeit
- **NFR-12** Editions-/Routendaten sind als pflegbare Datenstruktur abgelegt, sodass neue Editionen ohne Codeänderung an der Kernlogik ergänzbar sind.
- **NFR-13** Die Regel-/Validierungslogik ist von der Darstellung getrennt, um neue Klauseln/Challenge-Modi erweiterbar zu halten.

### 5.7 Externe Datenquellen & Rechtliches
- **NFR-14** Die Nutzung der externen API erfolgt **konform zu deren Fair-Use-Policy**: Antworten werden gecacht, Sprites möglichst selbst gehostet, keine unnötig hochfrequenten Abrufe (Schutz vor IP-Sperre, Schonung des Dienstes).
- **NFR-15** Die App ist als **privates, nicht-kommerzielles** Fan-Werkzeug ausgelegt. Sprite-Dateien stehen unter CC0, die zugrundeliegenden Pokémon-Marken und -Namen sind jedoch Eigentum von Nintendo/The Pokémon Company. Eine Monetarisierung ist nicht vorgesehen; bei späterer kommerzieller Nutzung wäre eine gesonderte rechtliche Prüfung erforderlich.

---

## 6. Datenmodell (konzeptionell)

Die folgenden Entitäten skizzieren das Domänenmodell (Detaillierung in Designphase):

- **Run** — id, name, challengeModus (nuzlocke/soullink), randomizerAktiv (bool), editionRef, regelwerk, status, erstelltAm, raumRef, randomizerKonfig?, metadaten.
- **Raum (Room)** — id (**UUID**, geräteunabhängiger Wiederfinde-Schlüssel), runRef, beitrittsCode, beitrittsLink, readOnlyLink?, passwortHash? (gesalzen, optional), resetEmail? (optional, nur für Passwort-Reset), aktivesResetToken? (kurzlebig, einmalig), mitglieder[] (Teilnehmer-Refs), erstellerRef, erstelltAm. Persistente Zugangsschicht; bündelt die Spieler:innen eines gemeinsamen Runs.
- **RandomizerKonfig** — seed, settingsDatei? (gespeicherte Originaldatei, z. B. `.rnqs`), extrahierteMetadaten? (toolVersion, romName), notiz, imRaumGeteilt (bool). (Nur vorhanden, wenn randomizerAktiv = true.)
- **Regelwerk** — aktiveKlauseln[], levelCapKonfiguration, eigeneRegeln[].
- **Gebiet (Encounter-Slot)** — id, runRef, name, reihenfolge, editionsHerkunft.
- **Encounter** — id, gebietRef, spielerRef (bei Soullink), spezies, spitzname, status, level, attribute (geschlecht/wesen/fähigkeit), notiz.
- **Pokémon** — id, encounterRef, status (team/box/friedhof/tot), aktuellesLevel, todeszeitpunkt, todesursache, ueberschreibung? (z. B. randomisierter Typ).
- **Link (Soullink)** — id, gebietRef, mitglieder[] (≥ 2 Pokémon-Refs, n-fähig), linkStatus.
- **Meilenstein** — id, runRef, bezeichnung, erreicht, zeitpunkt.
- **Logeintrag** — id, runRef, typ, beschreibung, zeitstempel.
- **Teilnehmer** — id, raumRef, rolle (besitzer/partner/zuschauer); persistente Raum-Mitgliedschaft.
- **Präsenz** *(flüchtig, nicht persistent)* — teilnehmerRef, online (bool), zuletztAktiv. Dient nur der Online-Anzeige (FR-31), keine eigene Sitzungs-Entität nötig.
- **Referenzdaten-Cache** — speziesId, name, typen, spriteUrl/-Blob, gebietsdaten; gespeist aus der externen API (Abschnitt 4.12), unabhängig vom Run-Zustand.

> **Persistenzschicht:** Der veränderliche Zustand (Raum, Run und untergeordnete Entitäten) wird zentral serverseitig gespeichert (z. B. SQLite, FR-40). Der JSON-Export (FR-39) ist eine vollständige, versionierte Serialisierung desselben Modells für Backup/Transfer. Beide sind von der externen Referenzdatenquelle entkoppelt.

---

## 7. Beispielhafte Akzeptanzkriterien (Auswahl)

- **AK-1 (zu FR-22/23):** *Gegeben* ein Soullink-Run mit einem intakten Paar (Route 3), *wenn* Spieler A sein Pokémon als tot markiert, *dann* wird Spieler Bs Partner automatisch als tot markiert und beide erscheinen im jeweiligen Friedhof mit Ursachebezug.
- **AK-2 (zu FR-12):** *Gegeben* ein Gebiet mit bereits erfolgreich gefangenem Encounter und deaktivierter Dupes-Klausel, *wenn* der Nutzer einen zweiten Encounter eintragen will, *dann* warnt das System und kennzeichnet den Eintrag als regelwidrig.
- **AK-3 (zu FR-29):** *Gegeben* beide Soullink-Spieler sind online, *wenn* Spieler A einen Encounter einträgt, *dann* erscheint dieser bei Spieler B ohne manuelles Neuladen.
- **AK-4 (zu FR-40):** *Gegeben* ein laufender Run, *wenn* die Seite neu geladen wird, *dann* ist der vollständige letzte Zustand wiederhergestellt.
- **AK-5 (zu FR-28/28b):** *Gegeben* Spieler:in A hat einen Soullink-Raum erstellt, *wenn* Spieler:in B den Beitritts-Code einlöst, *dann* erhält B Schreibzugriff auf den gemeinsamen Run und kann den Raum nach Schließen des Browsers vom selben Gerät erneut betreten, ohne den Code nochmals einzulösen.
- **AK-6 (zu FR-56/57):** *Gegeben* die App wird auf einem Smartphone-Browser geöffnet, *dann* sind alle Kernaktionen (Run/Raum anlegen oder beitreten, Encounter eintragen, Pokémon als tot markieren, Soullink-Übersicht ansehen) ohne horizontales Scrollen vollständig bedienbar.
- **AK-7 (zu FR-28c/d):** *Gegeben* ein passwortgeschützter Raum, *wenn* ein:e Spieler:in nach Cache-Verlust den Raum-Link (mit UUID) öffnet und das korrekte Passwort eingibt, *dann* erhält sie/er wieder Zugriff auf den gemeinsamen Run; bei falschem Passwort wird der Zugriff verweigert.
- **AK-8 (zu FR-39):** *Gegeben* ein exportierter Run als JSON, *wenn* dieser auf einem anderen Gerät importiert wird, *dann* ist der vollständige Run-Zustand (inkl. Friedhof, Links und Logbuch) identisch wiederhergestellt.

---

## 8. Priorisierung (MoSCoW)

| Priorität | Anforderungen |
|---|---|
| **Must** | FR-1–4, FR-6, FR-10–12, FR-16–20, FR-22–24, FR-24a, FR-28–28c, FR-29–30, FR-30a, FR-32a, FR-39–40, FR-40a, FR-42–46, FR-51–53, FR-56–59; NFR-1, NFR-4, NFR-6, NFR-8–9, NFR-14–15 |
| **Should** | FR-5, FR-7–9, FR-13–15, FR-23a, FR-25–27, FR-28d–28e, FR-33–39a, FR-47–48a, FR-49, FR-54–55; NFR-2–3, NFR-7, NFR-9a, NFR-10, NFR-12–13 |
| **Could** | FR-27a, FR-31–32, FR-41, FR-50, FR-60; NFR-5, NFR-11 |
| **Won't (v1)** | siehe Abschnitt 9 |

---

## 9. Nicht im Geltungsbereich (v1)

- Automatisches Auslesen des Spielzustands aus Emulator/ROM.
- Vollständige Movesets-, Typ-Effektivitäts- oder Strategie-Datenbank.
- Kampfsimulation oder Team-Builder-Funktionalität.
- **Voll ausgebaute UI** für mehr als zwei Spieler pro Soullink (Triple-Link): Das Datenmodell ist n-fähig vorzusehen (FR-27a, OP-5), die Bedien­oberfläche der v1 darf jedoch auf zwei Spieler beschränkt bleiben.
- **Natives App-Paket** mit App-Store-/Play-Store-Distribution: Die mobile Nutzung wird vollwertig über die **Handyansicht im Browser** abgedeckt (FR-56–59); ein natives Build ist nicht Bestandteil der v1. Eine installierbare PWA (FR-60) bleibt als optionaler Mittelweg möglich.

---

## 10. Entscheidungen & verbleibende offene Punkte

### 10.1 Getroffene Entscheidungen

- **E-1 (ehem. OP-1):** Kein verpflichtendes Konto. Für die erste Version genügt ein **anonymer, gerätegebundener Modus** (lokale Identität/Persistenz). Der gemeinsame Soullink-Zugriff erfolgt über einen **Raum** (FR-28–28e): Beide Spieler:innen treten demselben Raum bei und behalten persistente Mitgliedschaft. Wiederauffindbarkeit nach Gerätewechsel/Cache-Verlust über die **Raum-UUID** (FR-28c); Zugriffsschutz über **optionales Passwort** mit **E-Mail-basiertem Reset** (FR-28d/e) — ohne klassische Registrierung.
- **E-2 (ehem. OP-2):** Es werden **alle existierenden Editionen aller Generationen** mit vorbefüllten Routendaten unterstützt, soweit die Referenzquelle (Abschnitt 4.12) sie bereitstellt. Die Editions-Abbildung ist pflegbar gehalten (FR-55), um künftige Editionen zu ergänzen.
- **E-3 (ehem. OP-3):** Referenzdaten und Sprites stammen aus einer **öffentlich verfügbaren API (PokéAPI)**; Sprites werden gecacht/selbst gehostet, Fair-Use-Policy und CC0-Lizenzlage sind zu beachten (FR-51–55, NFR-14–15).
- **E-4 (ehem. OP-4):** Der **Run bleibt die persistente Aggregat-Entität**; die Spieler:innen-Zugehörigkeit wird über die **Raum-Entität** mit `mitglieder[]` abgebildet (statt eines `teilnehmer[]` direkt am Run). Eine eigene persistente „Sitzungs"-Entität ist nicht erforderlich; Online-/Verbindungszustand wird als **flüchtige Präsenz** geführt. Konfliktbehandlung über **Datenpartitionierung** (jede:r schreibt den eigenen Bereich) plus **atomare, vorzugsweise serverseitige Verarbeitung** der abgeleiteten/geteilten Zustände (FR-30, FR-30a).
- **E-5 (ehem. OP-5):** **Triple-/n-Spieler-Link wird architektonisch berücksichtigt** — der Link ist als n-fähige Mitglieder-Liste modelliert (FR-27a, Datenmodell), und die Raum-Mitgliederliste ist ebenfalls n-fähig. Die ausgebaute Bedienoberfläche dafür ist nicht v1-Pflicht (Abschnitt 9).
- **E-6:** Die **mobile Nutzung** wird als vollwertige **Handyansicht im Browser** erfüllt (FR-56–59); ein natives App-Paket entfällt, eine optionale PWA (FR-60) ist möglich.
- **E-7 (Persistenz & Datenhaltung):** Der Zustand wird **zentral serverseitig persistiert** (z. B. SQLite, FR-40); zusätzlich gibt es **JSON-Export/-Import** als dateibasiertes Backup/Transfer (FR-39). **Wichtig:** Diese Persistenzmechanismen sind vom **Echtzeit-Sync** (FR-29) zu trennen. Da Soullink eine *geteilte, server-vermittelte* Datenquelle erfordert, genügt eine rein lokale Speicherung (nur SQLite/JSON auf einem Gerät) für den Mehrspielerbetrieb nicht. Ein rein lokaler Modus ist allenfalls für **Solo-Runs offline** tragfähig (vgl. NFR-6).
- **E-8 (ehem. OP-C):** Randomizer-Einstellungen werden per **Settings-Datei-Upload** (`.rnqs` o. ä.) dokumentiert, nicht über nachgebaute Optionsfelder (FR-48). Es werden nur trivial lesbare Metadaten extrahiert (Tool-Version, ROM-Name); das herstellerspezifische Bitfeld wird **nicht** dekodiert. Bei Soullink ist die Datei im Raum teilbar (FR-48a), damit beide identisch randomisieren. Ergänzend ein freies Notizfeld für Seed/Anmerkungen.
- **E-9 (ehem. OP-D):** Bei Mehrfach-Links (n > 2) **propagiert der Tod standardmäßig vollständig** — stirbt ein Mitglied, sterben alle (FR-23a). Dies ist über eine **Klausel** anpassbar (FR-6), der Default bleibt vollständige Propagation. (Die genaue Semantik der Team-Synchronität bei großen Gruppen bleibt als Detailfrage in OP-D vermerkt, ist für v1 mit zwei Spielern aber nicht blockierend.)
- **E-10 (ehem. OP-E):** Es wird ein **eigenes Backend** umgesetzt: **FastAPI + SQLite** als zentraler Datenspeicher, **WebSockets/SSE** für den Echtzeit-Sync (FR-29). Die atomare Tod-Propagation (FR-23a/FR-30a) wird als **serverseitige Transaktion** im Backend umgesetzt (einzige Quelle der Wahrheit), nicht clientseitig.

### 10.2 Verbleibende offene Punkte

- **OP-A** *(weitgehend geklärt durch E-1)* Restfrage: Gültigkeitsdauer/Invalidierung von Beitritts-Code und Reset-Token, sowie ob ein Raum nach Beitritt beider Spieler:innen automatisch „abgeschlossen" wird (Missbrauchsschutz gegen unbefugten Beitritt).
- **OP-B** Granularität/Verlässlichkeit der Routendaten je Edition aus der Quelle (Vollständigkeit, korrekte Reihenfolge, Sonderfälle wie Geschenk-/statische Encounter) — ggf. ergänzende manuelle Pflege/Korrektur nötig.
- **OP-D** *(Kernfrage durch E-9 geklärt)* Restdetail für künftigen n-Spieler-Ausbau: genaue Semantik der **Team-Synchronität**, wenn die Spielerzahl die Teamgröße (6 Slots) tangiert — nicht blockierend für die v1 mit zwei Spielern.
