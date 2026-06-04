import { menu, maxLimity, vozidla } from "./data.js"; // import data.js
// Vozidlo
class Vozidlo {
    id;
    nazev;
    maxObjem; // cm3
    zaplnenyObjem = 0;
    zasilky = [];
    constructor(id, nazev, maxObjem) {
        this.id = id;
        this.nazev = nazev;
        this.maxObjem = maxObjem;
    }
    // pridani zasilky do vozidla, kontrola objemu
    pridatZasilku(z) {
        let objm = 0;
        if (z instanceof Balik)
            objm = z.objem;
        // dopisy nemaji objem
        if (this.zaplnenyObjem + objm > this.maxObjem) {
            return { ok: false, reason: 'Nedostatek volného objemu ve vozidle' };
        }
        this.zasilky.push(z);
        this.zaplnenyObjem += objm;
        return { ok: true };
    }
    zbyvajiciObjem() {
        return Math.max(0, this.maxObjem - this.zaplnenyObjem);
    }
    // Celková cena všech zásilek ve vozidle
    getCelkovaCena() {
        return this.zasilky.reduce((suma, z) => suma + z.vypocitejCenu(), 0);
    }
    // Procenta využití objemu
    getProcenta() {
        if (this.maxObjem === 0)
            return 0;
        return Math.round((this.zaplnenyObjem / this.maxObjem) * 100);
    }
    // Počet všech kusů (jednotlivých balíků/dopisů)
    getPocetKusu() {
        return this.zasilky.reduce((suma, z) => suma + z.mnozstvi, 0);
    }
    // Odebrání zásilky podle ID
    odebratZasilku(id) {
        const index = this.zasilky.findIndex(z => z.id === id);
        if (index === -1) {
            return { ok: false, reason: 'Zásilka nenalezena' };
        }
        const zasilka = this.zasilky[index];
        let objm = 0;
        if (zasilka instanceof Balik)
            objm = zasilka.objem;
        this.zasilky.splice(index, 1);
        this.zaplnenyObjem -= objm;
        return { ok: true, zasilka };
    }
    // Vyprázdnit vozidlo
    vyprazdnit() {
        this.zasilky = [];
        this.zaplnenyObjem = 0;
    }
    // Info o vozidlu
    getInfo() {
        return `${this.nazev} (${this.getPocetKusu()} kusů, ${this.getProcenta()}% obsazeno, cena: ${this.getCelkovaCena()} Kč)`;
    }
}
// Základní třída společných vlastností
class Zasilka {
    id;
    typ;
    nazev;
    cena; // za 1 kus
    mnozstvi;
    constructor(id, typ, nazev, cena, mnozstvi = 1) {
        if (!nazev || nazev.trim() == "")
            throw new Error("Název nesmí být prázdný"); //chybobé hlášky
        if (cena < 0)
            throw new Error("Cena nesmí být záporná");
        if (mnozstvi <= 0)
            throw new Error("Množství musí být kladné číslo");
        this.id = id;
        this.typ = typ;
        this.nazev = nazev;
        this.cena = cena;
        this.mnozstvi = Math.round(mnozstvi); // zaokrouhlení na celé číslo
    }
    // Info o zásilce
    getInfo() {
        return `${this.nazev} (${this.mnozstvi}x za ${this.cena} Kč = ${this.vypocitejCenu()} Kč)`;
    }
}
// Dopis
class Dopis extends Zasilka {
    constructor(id, nazev, cena, mnozstvi = 1) {
        super(id, 'dopis', nazev, cena, mnozstvi);
    }
    vypocitejCenu() {
        return this.cena * this.mnozstvi;
    }
    getInfo() {
        return `Dopis: ${super.getInfo()}`;
    }
}
// Balík
class Balik extends Zasilka {
    sirka; // cm
    vyska;
    hloubka;
    vaha; // kg
    objem; // cm3
    kategorie; // hledání z menu
    krehka = false; // krehka
    isTooLarge = false; // true pokud překročí limity
    constructor(id, nazev, sirka, vyska, hloubka, vaha, mnozstvi, krehka = false) {
        super(id, 'balik', nazev, 0, mnozstvi);
        if (sirka <= 0 || vyska <= 0 || hloubka <= 0)
            throw new Error('Rozměry musí být kladné'); // kontrola rozměrů
        if (vaha <= 0)
            throw new Error('Váha musí být kladná'); // kontrola váhy
        this.sirka = sirka; // cm
        this.vyska = vyska;
        this.hloubka = hloubka;
        this.vaha = vaha; // kg
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
        if (kateg)
            this.cena = kateg.cena;
    }
    urciKategorii() {
        const maly = menu.find(m => m.typ === 'balik-maly');
        const stredni = menu.find(m => m.typ === 'balik-stredni');
        const velky = menu.find(m => m.typ === 'balik-velky');
        const nadmerny = menu.find(m => m.typ === 'balik-nadmerny');
        const maxVahaMaly = maly?.maxVaha ?? Infinity;
        const maxVahaStredni = stredni?.maxVaha ?? Infinity;
        const maxVahaVelky = velky?.maxVaha ?? Infinity;
        const maxVahaNad = nadmerny?.maxVaha ?? Infinity;
        // Podle váhy určíme kategorii
        if (this.vaha > maxVahaNad)
            return 'prilis-velky';
        if (this.vaha > maxVahaVelky)
            return 'balik-nadmerny';
        if (this.vaha > maxVahaStredni)
            return 'balik-velky';
        if (this.vaha > maxVahaMaly)
            return 'balik-stredni';
        // Pokud váha OK, kontrolujeme objem
        const maxObjemMaly = maly?.maxObjem ?? Infinity;
        const maxObjemStredni = stredni?.maxObjem ?? Infinity;
        const maxObjemVelky = velky?.maxObjem ?? Infinity;
        const maxObjemNad = nadmerny?.maxObjem ?? Infinity;
        if (this.objem > maxObjemNad)
            return 'prilis-velky';
        if (this.objem > maxObjemVelky)
            return 'balik-nadmerny';
        if (this.objem > maxObjemStredni)
            return 'balik-velky';
        if (this.objem > maxObjemMaly)
            return 'balik-stredni';
        return 'balik-maly';
    }
    vypocitejCenu() {
        const perUnit = this.cena;
        const multiplier = this.krehka ? 1.3 : 1;
        return perUnit * multiplier * this.mnozstvi;
    }
    getInfo() {
        const krehkyInfo = this.krehka ? ' (KŘEHKÝ +30%)' : '';
        const rozmerInfo = `${this.sirka}x${this.vyska}x${this.hloubka}cm, ${this.vaha}kg`;
        return `Balík: #${this.id} ${this.nazev} [${rozmerInfo} ${krehkyInfo}] - kategorie: ${this.kategorie}, celkem: ${this.vypocitejCenu()} Kč`;
    }
}
//funkce pridani dopisu
function pridatDopis(nazev, druh, mnozstvi) {
    const typ = druh == 'dopis' ? 'dopis' : 'doporuceny';
    const pol = menu.find(m => m.typ == typ);
    if (!pol)
        throw new Error('Položka v menu nenalezena');
    return new Dopis(pol.id, nazev, pol.cena, mnozstvi);
}
// funkce pridani baliku
function pridatBalik(nazev, sirka, vyska, hloubka, vaha, mnozstvi, krehka = false) {
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
const dopisForm = document.getElementById('dopisForm');
const balikForm = document.getElementById('balikForm');
const zprava = document.getElementById('zprava');
const vypis = document.getElementById('vypis');
function vykresliVozidlo() {
    let html = '';
    html += '<p><b>Vozidlo:</b> ' + mojeVozidlo.nazev + '</p>';
    html += '<p><b>Pocet kusu:</b> ' + mojeVozidlo.getPocetKusu() + '</p>';
    html += '<p><b>Obsazeni:</b> ' + mojeVozidlo.getProcenta() + ' %</p>';
    html += '<p><b>Cena celkem:</b> ' + mojeVozidlo.getCelkovaCena() + ' Kc</p>';
    if (mojeVozidlo.zasilky.length === 0) {
        html += '<p>Zatim nejsou pridane zadne zasilky.</p>';
    }
    else {
        html += '<ul>';
        for (let i = 0; i < mojeVozidlo.zasilky.length; i++) {
            html += '<li>' + mojeVozidlo.zasilky[i].getInfo() + '</li>';
        }
        html += '</ul>';
    }
    vypis.innerHTML = html;
}
//pro dopis
const submitDopis = document.getElementById('submitDopis');
submitDopis.onclick = function (e) {
    const nazev = document.getElementById('dopisNazev').value;
    const druh = document.getElementById('dopisDruh').value;
    const mnozstvi = Number(document.getElementById('dopisMnozstvi').value);
    try {
        const novyDopis = pridatDopis(nazev, druh, mnozstvi);
        const vysledek = mojeVozidlo.pridatZasilku(novyDopis);
        if (vysledek.ok) {
            zprava.textContent = 'Dopis byl uspesne pridany.';
            dopisForm.reset();
            document.getElementById('dopisMnozstvi').value = '1';
            vykresliVozidlo();
        }
        else {
            zprava.textContent = 'Chyba: ' + vysledek.reason;
        }
    }
    catch (err) {
        const text = err instanceof Error ? err.message : 'Neznama chyba';
        zprava.textContent = 'Chyba: ' + text;
    }
};
//pro balik
const submitBalik = document.getElementById('submitBalik');
submitBalik.onclick = function (e) {
    const nazev = document.getElementById('balikNazev').value;
    const sirka = Number(document.getElementById('balikSirka').value);
    const vyska = Number(document.getElementById('balikVyska').value);
    const hloubka = Number(document.getElementById('balikHloubka').value);
    const vaha = Number(document.getElementById('balikVaha').value);
    const mnozstvi = Number(document.getElementById('balikMnozstvi').value);
    const krehky = document.getElementById('balikKrehky').checked;
    const objem = Math.round(sirka * vyska * hloubka);
    const limitCenik = menu.find(function (polozka) { return polozka.typ === 'balik-nadmerny'; });
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
            zprava.textContent = 'Balik byl uspesne pridany.';
            balikForm.reset();
            document.getElementById('balikMnozstvi').value = '1';
            vykresliVozidlo();
        }
        else {
            zprava.textContent = 'Chyba: ' + vysledek.reason;
        }
    }
    catch (err) {
        const text = err instanceof Error ? err.message : 'Neznama chyba';
        zprava.textContent = 'Chyba: ' + text;
    }
};
vykresliVozidlo();
