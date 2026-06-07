import {menu, maxLimity, vozidla} from "./data.js"; // import data.js
// Vozidlo
class Vozidlo {
    id: number;
    nazev: string;
    maxObjem: number; // cm3
    zaplnenyObjem: number = 0;
    zasilky: Zasilka[] = [];

    constructor(id: number, nazev: string, maxObjem: number) {
        this.id = id;
        this.nazev = nazev;
        this.maxObjem = maxObjem;
    }

    // pridani zasilky do vozidla, kontrola objemu
    pridatZasilku(z: Zasilka): { ok: boolean; reason?: string } {
        let objm = 0;
        if (z instanceof Balik) {
        objm = z.objem * z.mnozstvi; // Zohlednění celkového množství
        }
        // dopisy nemaji objem

        if (this.zaplnenyObjem + objm > this.maxObjem) {
            return { ok: false, reason: 'Nedostatek volného objemu ve vozidle' };
        }

        this.zasilky.push(z);
        this.zaplnenyObjem += objm;
        return { ok: true };
    }

    zbyvajiciObjem(): number {
        return Math.max(0, this.maxObjem - this.zaplnenyObjem);
    }

    // Celková cena všech zásilek ve vozidle
    getCelkovaCena(): number {
        return this.zasilky.reduce((suma, z) => suma + z.vypocitejCenu(), 0);
    }

    // Procenta využití objemu
    getProcenta(): number {
        if (this.maxObjem === 0) return 0;
        return Math.round((this.zaplnenyObjem / this.maxObjem) * 100);
    }

    // Počet všech kusů (jednotlivých balíků/dopisů)
    getPocetKusu(): number {
        return this.zasilky.reduce((suma, z) => suma + z.mnozstvi, 0);
    }

    // Odebrání zásilky podle ID
    odebratZasilku(id: number): { ok: boolean; reason?: string; zasilka?: Zasilka } {
        const index = this.zasilky.findIndex(z => z.id === id);
        if (index === -1) {
            return { ok: false, reason: 'Zásilka nenalezena' };
        }
        const zasilka = this.zasilky[index];
        let objm = 0;
        if (zasilka instanceof Balik) {
        objm = zasilka.objem * zasilka.mnozstvi; // Zohlednění celkového množství
}
        this.zasilky.splice(index, 1);
        this.zaplnenyObjem -= objm;
        return { ok: true, zasilka };
    }

    // Vyprázdnit vozidlo
    vyprazdnit(): void {
        this.zasilky = [];
        this.zaplnenyObjem = 0;
    }

    // Info o vozidlu
    getInfo(): string {
        return `${this.nazev} (${this.getPocetKusu()} kusů, ${this.getProcenta()}% obsazeno, cena: ${this.getCelkovaCena()} Kč)`;
    }
}
// Základní třída společných vlastností
abstract class Zasilka {
    id: number;
    typ: string;
    nazev: string;
    cena: number; // za 1 kus
    mnozstvi: number;

    constructor(id: number, typ: string, nazev: string, cena: number, mnozstvi = 1) {
        if (!nazev || nazev.trim() == "") throw new Error("Název nesmí být prázdný"); //chybobé hlášky
        if (cena < 0) throw new Error("Cena nesmí být záporná");
        if (mnozstvi <= 0) throw new Error("Množství musí být kladné číslo");
        this.id = id;
        this.typ = typ;
        this.nazev = nazev;
        this.cena = cena;
        this.mnozstvi = Math.round(mnozstvi); // zaokrouhlení na celé číslo
    }

    // pocitani ceny abstraktni
    abstract vypocitejCenu(): number;

    // Info o zásilce
    getInfo(): string {
        return `${this.nazev} (${this.mnozstvi}x za ${this.cena} Kč = ${this.vypocitejCenu()} Kč)`;
    }
}

// Dopis
class Dopis extends Zasilka {
    constructor(id: number, nazev: string, cena: number, mnozstvi = 1) {
        super(id, 'dopis', nazev, cena, mnozstvi);
    }

    vypocitejCenu(): number {
        return this.cena * this.mnozstvi;
    }

    getInfo(): string {
        return `Dopis: ${super.getInfo()}`;
    }
}


// Balík
class Balik extends Zasilka {
    sirka: number; // cm
    vyska: number;
    hloubka: number;
    vaha: number; // kg
    objem: number; // cm3
    kategorie: string; // hledání z menu
    krehka: boolean = false; // krehka
    isTooLarge: boolean = false; // true pokud překročí limity

    constructor(id: number, nazev: string, sirka: number, vyska: number, hloubka: number, vaha: number, mnozstvi: number, krehka: boolean = false) {

        super(id, 'balik', nazev, 0, mnozstvi);

        if (sirka <= 0 || vyska <= 0 || hloubka <= 0) throw new Error('Rozměry musí být kladné'); // kontrola rozměrů
        if (vaha <= 0) throw new Error('Váha musí být kladná'); // kontrola váhy

        this.sirka = sirka;     // cm
        this.vyska = vyska;     
        this.hloubka = hloubka; 
        this.vaha = vaha;       // kg
        this.krehka = krehka;

        
        this.objem = Math.round(sirka * vyska * hloubka); //spočítáme objem z rozměrů (cm3)

        if (this.vaha > maxLimity.maxVahaBalik || this.objem > maxLimity.maxObjemBalik) { //vetsi než max limity
            this.isTooLarge = true;
            this.kategorie = 'prilis-velky';
            this.cena = 0;
            console.warn('Zásilka překračuje povolený maximální rozměr nebo váhu (označeno jako příliš velké).');
            return; // ukonceni konstruktoru
        }

        this.kategorie = this.urciKategorii(); // určujeme kategorii
        const kateg = menu.find(kat => kat.typ === this.kategorie); // podle kategorie cena z menu
        if (kateg) this.cena = kateg.cena;
    }

    urciKategorii(): string {
        const maly = menu.find(m => m.typ === 'balik-maly');
        const stredni = menu.find(m => m.typ === 'balik-stredni');
        const velky = menu.find(m => m.typ === 'balik-velky');
        const nadmerny = menu.find(m => m.typ === 'balik-nadmerny');

        const maxVahaMaly = maly?.maxVaha ?? Infinity;
        const maxVahaStredni = stredni?.maxVaha ?? Infinity;
        const maxVahaVelky = velky?.maxVaha ?? Infinity;
        const maxVahaNad = nadmerny?.maxVaha ?? Infinity;

        // Podle váhy určíme kategorii
        if (this.vaha > maxVahaNad) return 'prilis-velky';
        if (this.vaha > maxVahaVelky) return 'balik-nadmerny';
        if (this.vaha > maxVahaStredni) return 'balik-velky';
        if (this.vaha > maxVahaMaly) return 'balik-stredni';

        // Pokud váha OK, kontrolujeme objem
        const maxObjemMaly = maly?.maxObjem ?? Infinity;
        const maxObjemStredni = stredni?.maxObjem ?? Infinity;
        const maxObjemVelky = velky?.maxObjem ?? Infinity;
        const maxObjemNad = nadmerny?.maxObjem ?? Infinity;

        if (this.objem > maxObjemNad) return 'prilis-velky';
        if (this.objem > maxObjemVelky) return 'balik-nadmerny';
        if (this.objem > maxObjemStredni) return 'balik-velky';
        if (this.objem > maxObjemMaly) return 'balik-stredni';
        return 'balik-maly';
    }

    vypocitejCenu(): number {
        const perUnit = this.cena;
        const multiplier = this.krehka ? 1.3 : 1;
        return perUnit * multiplier * this.mnozstvi;
    }

    getInfo(): string {
        const krehkyInfo = this.krehka ? ' (KŘEHKÝ +30%)' : '';
        const rozmerInfo = `${this.sirka}x${this.vyska}x${this.hloubka}cm, ${this.vaha}kg`;
        return `Balík: #${this.id} ${this.nazev} [${rozmerInfo} ${krehkyInfo}] - kategorie: ${this.kategorie}, celkem: ${this.vypocitejCenu()} Kč`;
    }
}

//funkce pridani dopisu
function pridatDopis(nazev: string, druh: 'dopis' | 'doporuceny', mnozstvi: number): Dopis {
    const typ = druh ==  'dopis' ? 'dopis' : 'doporuceny';
    const pol = menu.find(m => m.typ == typ);
    if (!pol) throw new Error('Položka v menu nenalezena');
    const unikatniId = Math.floor(Math.random() * 100000); 
    return new Dopis(unikatniId, nazev, pol.cena, mnozstvi);
}

// funkce pridani baliku
function pridatBalik(nazev: string, sirka: number, vyska: number, hloubka: number, vaha: number, mnozstvi: number, krehka: boolean = false): Balik | null {
    const id = 100 + Math.floor(Math.random() * 900);
    // před vytvořením instance zkontrolujeme globální limity
    const objem = Math.round(sirka * vyska * hloubka);
    if (vaha > maxLimity.maxVahaBalik || objem > maxLimity.maxObjemBalik) {
        console.warn('Balík překračuje globální limity - nebude vytvořen.');
        return null;
    }
    return new Balik(id, nazev, sirka, vyska, hloubka, vaha, mnozstvi, krehka);
}

//propojeni s HTML
const configVozidlo = vozidla[0];
const mojeVozidlo = new Vozidlo(configVozidlo.id, configVozidlo.nazev, configVozidlo.maxObjem);

const dopisForm = document.getElementById('dopisForm') as HTMLFormElement;
const balikForm = document.getElementById('balikForm') as HTMLFormElement;
const zprava = document.getElementById('zprava') as HTMLParagraphElement;
const zpravaBox = document.getElementById('zprava-box') as HTMLDivElement;
const vypis = document.getElementById('vypis') as HTMLDivElement;

// Pomocná funkce pro hezké zobrazení hlášek (zelená/červená/modrá)
function zobrazHlasku(text: string, typ: 'success' | 'error' | 'info'): void {
    zprava.textContent = text;
    zpravaBox.className = "w3-panel w3-leftbar w3-padding "; // reset tříd

    if (typ === 'success') {
        zpravaBox.classList.add("w3-border-green", "w3-pale-green");
    } else if (typ === 'error') {
        zpravaBox.classList.add("w3-border-red", "w3-pale-red");
    } else {
        zpravaBox.classList.add("w3-border-blue", "w3-pale-blue");
    }
}

function vykresliVozidlo(): void {
    let html = '';
    const procenta = mojeVozidlo.getProcenta();

    // Určení barvy grafu podle zaplnění dodávky
    let barvaGrafu = 'w3-green';
    if (procenta > 75) barvaGrafu = 'w3-orange';
    if (procenta > 90) barvaGrafu = 'w3-red';

    // Výpis detailů dodávky
    html += '<div class="w3-container w3-light-grey w3-padding w3-round w3-margin-bottom">';
    html += '<h4><b>Název vozidla:</b> ' + mojeVozidlo.nazev + '</h4>';
    html += '<p><b>Počet naložených kusů celkem:</b> ' + mojeVozidlo.getPocetKusu() + ' ks</p>';
    html += '<p><b>Celková cena dopravy:</b> <span class="w3-tag w3-large w3-amber w3-round"><b>' + mojeVozidlo.getCelkovaCena() + ' Kč</b></span></p>';
    html += '<p><b>Zaplněný objem:</b> ' + mojeVozidlo.zaplnenyObjem + ' / ' + mojeVozidlo.maxObjem + ' cm³ (' + procenta + ' %)</p>';

    // W3.CSS Vizuální progress bar kapacity
    html += '<div class="w3-light-grey w3-round-xlarge w3-border">';
    html += '<div class="w3-container w3-round-xlarge w3-center ' + barvaGrafu + '" style="width:' + Math.min(procenta, 100) + '%">' + procenta + '%</div>';
    html += '</div>';
    html += '</div>';

    // Výpis jednotlivých balíků a dopisů
    html += '<h4> Seznam položek v nákladovém prostoru:</h4>';
    if (mojeVozidlo.zasilky.length === 0) {
        html += '<p class="w3-text-grey">Vozidlo je prázdné, zatím nebylo nic naloženo.</p>';
    } else {
        html += '<ul class="w3-ul w3-border w3-white w3-round">';
        for (let i = 0; i < mojeVozidlo.zasilky.length; i++) {
            const z = mojeVozidlo.zasilky[i];
            html += '<li class="zasilka-item">';
            html += '<span>' + z.getInfo() + '</span>';
            // Tlačítko pro odebrání s voláním globální funkce
            html += '<button class="w3-button w3-red w3-round w3-small" onclick="odebratZasilkuUI(' + z.id + ')">Odebrat</button>';
            html += '</li>';
        }
        html += '</ul>';
    }

    vypis.innerHTML = html;
}
// Zpřístupnění funkce odebírání pro HTML inline onclick
(window as any).odebratZasilkuUI = function (id: number) {
    const vysledek = mojeVozidlo.odebratZasilku(id);
    if (vysledek.ok) {
        zobrazHlasku('Zásilka byla úspěšně vyložena z vozidla.', 'success');
        vykresliVozidlo();
    } else {
        zobrazHlasku('Chyba: ' + vysledek.reason, 'error');
    }
};

//pro dopis
const submitDopis = document.getElementById('submitDopis') as HTMLButtonElement;
submitDopis.onclick = function (e) {
    const nazev = (document.getElementById('dopisNazev') as HTMLInputElement).value;
    const druh = (document.getElementById('dopisDruh') as HTMLSelectElement).value as 'dopis' | 'doporuceny';
    const mnozstvi = Number((document.getElementById('dopisMnozstvi') as HTMLInputElement).value);

    if (nazev.trim() === "") {
    zobrazHlasku("Chyba: Zadejte prosím název dopisu.", "error");
    return;
    }
    try {
        const novyDopis = pridatDopis(nazev, druh, mnozstvi);
        const vysledek = mojeVozidlo.pridatZasilku(novyDopis);

        if (vysledek.ok) {
            zobrazHlasku('Dopis byl úspěšně naložen do vozidla.', 'success');
            dopisForm.reset();
            (document.getElementById('dopisMnozstvi') as HTMLInputElement).value = '1';
            vykresliVozidlo();

        } else {
            zobrazHlasku('Chyba: ' + vysledek.reason, 'error');
        }
    } catch (err) {
        const text = err instanceof Error ? err.message : 'Neznama chyba';
        zobrazHlasku('Chyba: ' + text, 'error');
    }
};
//pro balik
const submitBalik = document.getElementById('submitBalik') as HTMLButtonElement;
submitBalik.onclick = function (e) {
    
    const nazev = (document.getElementById('balikNazev') as HTMLInputElement).value;
    const sirka = Number((document.getElementById('balikSirka') as HTMLInputElement).value);
    const vyska = Number((document.getElementById('balikVyska') as HTMLInputElement).value);
    const hloubka = Number((document.getElementById('balikHloubka') as HTMLInputElement).value);
    const vaha = Number((document.getElementById('balikVaha') as HTMLInputElement).value);
    const mnozstvi = Number((document.getElementById('balikMnozstvi') as HTMLInputElement).value);
    const krehky = (document.getElementById('balikKrehky') as HTMLInputElement).checked;
    const objem = Math.round(sirka * vyska * hloubka);
    const limitCenik = menu.find(function (polozka) { return polozka.typ === 'balik-nadmerny'; });
    if (nazev.trim() === "") {
    zobrazHlasku("Chyba: Zadejte prosím název balíku.", "error");
    return;
    }
    if (sirka <= 0 || vyska <= 0 || hloubka <= 0 || vaha <= 0) {
    zobrazHlasku("Chyba: Rozměry a váha musí být kladná čísla.", "error");
    return;
    }

    if (vaha > maxLimity.maxVahaBalik) {
        zprava.textContent = 'Chyba: Balik ma moc velkou vahu. Maximum je ' + maxLimity.maxVahaBalik + ' kg.';
        return;
    }

    if (objem > maxLimity.maxObjemBalik) {
        zprava.textContent = 'Chyba: Balik ma moc velky objem. Maximum je ' + maxLimity.maxObjemBalik + ' cm3.';
        return;
    }

    if (limitCenik && limitCenik.maxVaha !== undefined && vaha > limitCenik.maxVaha) {
        zprava.textContent = 'Chyba: Balik je nad limit ceniku. Maximalni vaha je ' + limitCenik.maxVaha + ' kg.';
        return;
    }

    if (limitCenik && limitCenik.maxObjem !== undefined && objem > limitCenik.maxObjem) {
        zprava.textContent = 'Chyba: Balik je nad limit ceniku. Maximalni objem je ' + limitCenik.maxObjem + ' cm3.';
        return;
    }

    try {
        const novyBalik = pridatBalik(nazev, sirka, vyska, hloubka, vaha, mnozstvi, krehky);

        if (novyBalik === null) {
            zprava.textContent = 'Balik je moc velky nebo tezky.';
            return;
        }

        const vysledek = mojeVozidlo.pridatZasilku(novyBalik);
        if (vysledek.ok) {
            zobrazHlasku('Balík byl úspěšně naložen do vozidla.', 'success');
            balikForm.reset();
            (document.getElementById('balikMnozstvi') as HTMLInputElement).value = '1';
            vykresliVozidlo();
        } else {
            zobrazHlasku('Chyba: ' + vysledek.reason, 'error');
        }
    } catch (err) {
        const text = err instanceof Error ? err.message : 'Neznama chyba';
        zprava.textContent = 'Chyba: ' + text;
    }
};

vykresliVozidlo();