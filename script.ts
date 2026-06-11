import {menu, maxLimity, vozidla} from "./data.js"; // import data.js
// Vozidlo
class Vozidlo {
    id: number;
    nazev: string;
    maxObjem: number; // cm3
    zaplnenyObjem: number = 0;
    zasilky: Zasilka[] = [];

    constructor(id: number, nazev: string, maxObjem: number) { // konstruktor pro vozidlo
        this.id = id;
        this.nazev = nazev;
        this.maxObjem = maxObjem;
    }

    // pridani zasilky do vozidla, kontrola objemu
    pridatZasilku(z: Zasilka): { ok: boolean; reason?: string } {
        let objm = 0;
        if (z instanceof Balik) {
        objm = z.objem * z.mnozstvi; // objem krat mnozstvi pro baliky (pro dopis objem 0)
        }

        if (this.zaplnenyObjem + objm > this.maxObjem) { // kontrola, zda se zasilka vejde do vozidla
            return { ok: false, reason: 'Nedostatek volného objemu ve vozidle' };
        }

        this.zasilky.push(z); // prida do seznamu zasilek
        this.zaplnenyObjem += objm;
        return { ok: true };
    }

    zbyvajiciObjem(): number { //pocita zbytek objemu ve vozidle
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
        if (index === -1) { // zásilka nenalezena
            return { ok: false, reason: 'Zásilka nenalezena' };
        }
        const zasilka = this.zasilky[index]; // získáme zásilku pro výpočet objemu
        let objm = 0;
        if (zasilka instanceof Balik) {
        objm = zasilka.objem * zasilka.mnozstvi; // Zohlednění celkového množství
}
        this.zasilky.splice(index, 1); // odstraní zásilku ze seznamu
        this.zaplnenyObjem -= objm; // aktualizace zaplněného objemu
        return { ok: true, zasilka }; // vrací odebranou zásilku
    }

    // Vyprázdnit vozidlo
    vyprazdnit(): void {
        this.zasilky = [];
        this.zaplnenyObjem = 0;
    }

    // Info o vozidlu
    getInfo(): string {
        return `${this.nazev} (${this.getPocetKusu()} kusů, ${this.getProcenta()}% obsazeno, cena: ${this.getCelkovaCena()} Kč)`; // zobrazení informací o vozidle
    }
}
// Základní třída společných vlastností pro zasilky
abstract class Zasilka {
    id: number;
    typ: string;
    nazev: string;
    cena: number; // za 1 kus
    mnozstvi: number;

    constructor(id: number, typ: string, nazev: string, cena: number, mnozstvi = 1) { // konstruktor pro zasilku
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
        return `Název: ${this.nazev}, Množství: ${this.mnozstvi}, Celkem: ${this.vypocitejCenu()} Kč`;
    }
}

// Dopis
class Dopis extends Zasilka {
    constructor(id: number, typ:string, nazev: string, cena: number, mnozstvi = 1) { // konstruktor pro dopis, volá konstruktor základní třídy s typem 'dopis'
        super(id, typ, nazev, cena, mnozstvi);
    }

    vypocitejCenu(): number {
        return this.cena * this.mnozstvi;
    }
    urciKategorii(): string {
        if (this.typ === 'standardni')  return 'Standardní';
        if (this.typ === 'doporuceny') return 'Doporučený';
        return 'Neznámý';
    }
    getInfo(): string {
        return `Dopis: Kategorie: ${this.urciKategorii()}, ${super.getInfo()}`;
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

        if (sirka <= 0 || vyska <= 0 || hloubka <= 0) throw new Error('Rozměry must být kladné'); // kontrola rozměrů
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

        this.kategorie = this.urciKategorii(); // určujeme technickou kategorii (např. 'balik-maly')
        
        const kateg = menu.find(kat => kat.typ === this.kategorie); 
        if (kateg) {
            this.cena = kateg.cena; // cena podle kategorie z menu
        }
    }

    urciKategorii(): string { // určení kategorie podle váhy a objemu z menu (vrací klíče pro ceník)
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

    // prevod nazvu do menu
    getKategorieNazev(): string {
        if (this.kategorie === 'balik-maly') return 'Malý balík';
        if (this.kategorie === 'balik-stredni') return 'Střední balík';
        if (this.kategorie === 'balik-velky') return 'Velký balík';
        if (this.kategorie === 'balik-nadmerny') return 'Nadměrný balík';
        return 'Příliš velký';
    }

    vypocitejCenu(): number { // cena za kus z menu, krehky +30%, vynasobeno mnozstvim
        const kus = this.cena;
        const multiplier = this.krehka ? 1.3 : 1;
        return kus * multiplier * this.mnozstvi;
    }

    getInfo(): string { // zobrazení informací o balíku, včetně rozměrů, váhy, křehkosti a kategorie
        const krehkyInfo = this.krehka ? ' (Křehký +30%)' : '';
        const rozmerInfo = `${this.sirka}x${this.vyska}x${this.hloubka}cm, ${this.vaha}kg`;
        return `Balík: #${this.id} ${this.nazev} [${rozmerInfo} ${krehkyInfo}] - Kategorie: ${this.getKategorieNazev()}, Množství: ${this.mnozstvi}, Celkem: ${this.vypocitejCenu()} Kč`;
    }
}

//funkce pridani dopisu
function pridatDopis(nazev: string, druh: 'standardni' | 'doporuceny', mnozstvi: number): Dopis {
    const typ = druh ==  'standardni' ? 'standardni' : 'doporuceny';
    const pol = menu.find(m => m.typ == typ);
    if (!pol) throw new Error('Položka v menu nenalezena');
    const unikatniId = Math.floor(Math.random() * 100000); // generování unikátního ID pro dopis
    return new Dopis(unikatniId, typ, nazev, pol.cena, mnozstvi);
}

// funkce pridani baliku
function pridatBalik(nazev: string, sirka: number, vyska: number, hloubka: number, vaha: number, mnozstvi: number, krehka: boolean = false): Balik | null {
    const id = 100 + Math.floor(Math.random() * 900);
    
    // Výpočet pro jeden kus a pro celou sérii
    const objemZaKus = Math.round(sirka * vyska * hloubka);
    const celkovyObjem = objemZaKus * mnozstvi;
    const celkovaVaha = vaha * mnozstvi;

    // Kontrola globálních limitů vůči celkové zásilce
    if (celkovaVaha > maxLimity.maxVahaBalik || celkovyObjem > maxLimity.maxObjemBalik) { 
        console.warn('Balíky v tomto množství překračují globální limity dodávky.');
        return null;
    }
    return new Balik(id, nazev, sirka, vyska, hloubka, vaha, mnozstvi, krehka);
}

//propojeni s HTML
const configVozidlo = vozidla[0];
const mojeVozidlo = new Vozidlo(configVozidlo.id, configVozidlo.nazev, configVozidlo.maxObjem);
// HTML elementy
const dopisForm = document.getElementById('dopisForm') as HTMLFormElement; 
const balikForm = document.getElementById('balikForm') as HTMLFormElement;
const zprava = document.getElementById('zprava') as HTMLParagraphElement;
const zpravaBox = document.getElementById('zprava-box') as HTMLDivElement;
const vypis = document.getElementById('vypis') as HTMLDivElement;

// Pomocná funkce pro zobrazení hlášek (zelená/červená/modrá)
function zobrazHlasku(text: string, typ: 'success' | 'error' | 'info'): void {
    zprava.textContent = text;
    zpravaBox.className = "w3-panel w3-leftbar w3-padding "; // reset tříd

    if (typ === 'success') { // zelená pro úspěch
        zpravaBox.classList.add("w3-border-green", "w3-pale-green");
    } else if (typ === 'error') { // červená pro chybu
        zpravaBox.classList.add("w3-border-red", "w3-pale-red");
    } else { // modrá pro info
        zpravaBox.classList.add("w3-border-blue", "w3-pale-blue");
    }
}
// vykreslení informací o vozidle a jeho zásilkách
function vykresliVozidlo(): void { 
    let html = ''; 
    const procenta = mojeVozidlo.getProcenta(); // procenta zaplnění vozidla pro grafické zobrazení

    // Určení barvy grafu podle zaplnění dodávky
    let barvaGrafu = 'w3-green';
    if (procenta > 75) barvaGrafu = 'w3-orange'; // oranžová pro více než 75%
    if (procenta > 90) barvaGrafu = 'w3-red'; // červená pro více než 90%

    // Výpis detailů dodávky
    html += '<div class="w3-container w3-light-grey w3-padding w3-round w3-margin-bottom">'; // kontejner pro informace o vozidle
    html += '<h4><b>Název vozidla:</b> ' + mojeVozidlo.nazev + '</h4>'; // název vozidla
    html += '<p><b>Počet naložených kusů celkem:</b> ' + mojeVozidlo.getPocetKusu() + ' ks</p>'; // počet kusů
    html += '<p><b>Celková cena dopravy:</b> <span class="w3-tag w3-large w3-amber w3-round"><b>' + mojeVozidlo.getCelkovaCena() + ' Kč</b></span></p>'; // celkova cena označena žlutou značkou
    html += '<p><b>Zaplněný objem:</b> ' + mojeVozidlo.zaplnenyObjem + ' / ' + mojeVozidlo.maxObjem + ' cm³ (' + procenta + ' %)</p>'; // zobrazení zaplněného objemu a procenta

    // W3.CSS progress bar kapacity
    html += '<div class="w3-light-grey w3-round-xlarge w3-border">';
    html += '<div class="w3-container w3-round-xlarge w3-center ' + barvaGrafu + '" style="width:' + Math.min(procenta, 100) + '%">' + procenta + '%</div>';
    html += '</div>';
    html += '</div>';

    // Výpis jednotlivých balíků a dopisů
    html += '<h4> Seznam položek v nákladovém prostoru:</h4>';
    
    if (mojeVozidlo.zasilky.length === 0) { // pokud není nic naloženo, zobrazí se hláška
        html += '<div class="w3-panel w3-border w3-border-light-grey w3-text-grey w3-center w3-round w3-white" style="padding: 24px;">';
        html += 'Vozidlo je prázdné, zatím nebylo nic naloženo.';
        html += '</div>';
    } else {
        // Použití W3.CSS card a hoverable seznamu
        html += '<ul class="w3-ul w3-card-4 w3-white w3-round w3-hoverable" style="overflow: hidden;">'; 
        for (let i = 0; i < mojeVozidlo.zasilky.length; i++) { 
            const z = mojeVozidlo.zasilky[i];
            
            // Řádek seznamu využívající w3-bar pro rozložení (text vlevo, tlačítko vpravo)
            html += '<li class="w3-bar w3-border-bottom" style="padding: 12px 16px;">'; 
            
            // Tlačítko pro odebrání (zarovnáno doprava pomocí w3-right)
            html += '<button class="w3-bar-item w3-button w3-right w3-text-red w3-hover-red w3-white w3-border w3-border-red w3-round w3-small" style="margin-top: 4px;" onclick="odebratZasilkuUI(' + z.id + ')">Odebrat</button>'; 
            
            //text + z.getInfo()
            html += '<div class="w3-bar-item" style="white-space: normal; padding-left: 0;">';
            html += '<span class="w3-text-grey" style="margin-right: 10px;">#' + z.id + '</span>'; //ID
            html += '<span style="font-weight: 500;">' + z.getInfo() + '</span>';
            html += '</div>';
            
            html += '</li>';
        }
        html += '</ul>'; 
    }

    // Aktualizace HTML s informacemi o vozidle a zásilkách
    vypis.innerHTML = html;
}

// Zpřístupnění funkce odebírání pro HTML inline onclick
(window as any).odebratZasilkuUI = function (id: number) { // funkce pro odebrání zásilky z UI, volá metodu vozidla a zobrazuje hlášku
    const vysledek = mojeVozidlo.odebratZasilku(id);
    if (vysledek.ok) {
        zobrazHlasku('Zásilka byla úspěšně vyložena z vozidla.', 'success'); // zobrazení úspěšné hlášky
        vykresliVozidlo();
    } else {
        zobrazHlasku('Chyba: ' + vysledek.reason, 'error'); // zobrazení chybové hlášky
    }
};

//pro dopis
const submitDopis = document.getElementById('submitDopis') as HTMLButtonElement;
submitDopis.onclick = function (e) {
    const nazev = (document.getElementById('dopisNazev') as HTMLInputElement).value;
    const druh = (document.getElementById('dopisDruh') as HTMLSelectElement).value as 'standardni' | 'doporuceny';
    const mnozstvi = Number((document.getElementById('dopisMnozstvi') as HTMLInputElement).value); // převod množství na číslo

    if (nazev.trim() === "") { // kontrola, zda je název dopisu zadán
    zobrazHlasku("Chyba: Zadejte prosím název dopisu.", "error");
    return;
    } 
    try { // vytvoření dopisu a přidání do vozidla
        const novyDopis = pridatDopis(nazev, druh, mnozstvi);
        const vysledek = mojeVozidlo.pridatZasilku(novyDopis);

        if (vysledek.ok) { // pokud se dopis úspěšně přidal, zobrazí se hláška a aktualizuje zobrazení vozidla
            zobrazHlasku('Dopis byl úspěšně naložen do vozidla.', 'success');
            dopisForm.reset();
            (document.getElementById('dopisMnozstvi') as HTMLInputElement).value = '1'; // reset množství na 1 po úspěšném přidání
            vykresliVozidlo();

        } else {
            zobrazHlasku('Chyba: ' + vysledek.reason, 'error'); // pokud se dopis nepřidal, zobrazí se chybová hláška s důvodem
        }
    } catch (err) { // pokud dojde k chybě při vytváření dopisu, zobrazí se chybová hláška s textem chyby
        const text = err instanceof Error ? err.message : 'Neznama chyba';
        zobrazHlasku('Chyba: ' + text, 'error');
    }
};
//pro balik
const submitBalik = document.getElementById('submitBalik') as HTMLButtonElement;
submitBalik.onclick = function (e) { // získání hodnot z formuláře pro balík
    
    const nazev = (document.getElementById('balikNazev') as HTMLInputElement).value;
    const sirka = Number((document.getElementById('balikSirka') as HTMLInputElement).value);
    const vyska = Number((document.getElementById('balikVyska') as HTMLInputElement).value);
    const hloubka = Number((document.getElementById('balikHloubka') as HTMLInputElement).value);
    const vaha = Number((document.getElementById('balikVaha') as HTMLInputElement).value);
    const mnozstvi = Number((document.getElementById('balikMnozstvi') as HTMLInputElement).value);
    const krehky = (document.getElementById('balikKrehky') as HTMLInputElement).checked;
    const objem = Math.round(sirka * vyska * hloubka);
    const limitCenik = menu.find(function (polozka) { return polozka.typ === 'balik-nadmerny'; }); // získání limitů pro nadměrný balík z menu
    //chybove hlasky, kontrola vstupu a limitu

    if (nazev.trim() === "") {
    zobrazHlasku("Chyba: Zadejte prosím název balíku.", "error"); // kontrola, zda je název balíku zadán
    return;
    }
    if (sirka <= 0 || vyska <= 0 || hloubka <= 0 || vaha <= 0) { // kontrola, zda jsou rozměry a váha kladná čísla
    zobrazHlasku("Chyba: Rozměry a váha musí být kladná čísla.", "error");
    return;
    }

    if (vaha > maxLimity.maxVahaBalik) { // kontrola, zda váha nepřekračuje globální limit pro balík
        zprava.textContent = 'Chyba: Balík má moc velkou váhu. Maximum je ' + maxLimity.maxVahaBalik + ' kg.';
        return;
    }

    if (objem > maxLimity.maxObjemBalik) {
        zprava.textContent = 'Chyba: Balík má moc velký objem. Maximum je ' + maxLimity.maxObjemBalik + ' cm3.';
        return;
    }

    if (limitCenik && limitCenik.maxVaha !== undefined && vaha > limitCenik.maxVaha) {
        zprava.textContent = 'Chyba: Balík je nad limit ceníku. Maximalní váha je ' + limitCenik.maxVaha + ' kg.';
        return;
    }

    if (limitCenik && limitCenik.maxObjem !== undefined && objem > limitCenik.maxObjem) {
        zprava.textContent = 'Chyba: Balík je nad limit ceníku. Maximalní objem je ' + limitCenik.maxObjem + ' cm3.';
        return;
    }

    const objemJedenKus = Math.round(sirka * vyska * hloubka);
    const celkovyObjem = objemJedenKus * mnozstvi;
    const celkovaVaha = vaha * mnozstvi;
// 1. Kontrola celkové váhy všech kusů
    if (celkovaVaha > maxLimity.maxVahaBalik) { 
    zobrazHlasku('Chyba: Celková váha nákladu (' + celkovaVaha + ' kg) překračuje maximum vozidla ' + maxLimity.maxVahaBalik + ' kg.', 'error');
    return;
    }

// 2. Kontrola celkového objemu všech kusů
    if (celkovyObjem > maxLimity.maxObjemBalik) {
    zobrazHlasku('Chyba: Celkový objem nákladu (' + celkovyObjem + ' cm³) překračuje maximum vozidla ' + maxLimity.maxObjemBalik + ' cm³.', 'error');
    return;
    }
    
    // Vytvoření balíku a přidání do vozidla
    try {
        const novyBalik = pridatBalik(nazev, sirka, vyska, hloubka, vaha, mnozstvi, krehky);

        if (novyBalik === null) { // pokud balík překračuje globální limity, zobrazí se chybová hláška a balík se nevytvoří
            zprava.textContent = 'Balík je moc velký nebo těžký.';
            return;
        }

        const vysledek = mojeVozidlo.pridatZasilku(novyBalik); // pokus o přidání balíku do vozidla, kontrola kapacity a zobrazení hlášky podle výsledku
        if (vysledek.ok) {
            zobrazHlasku('Balík byl úspěšně naložen do vozidla.', 'success');
            balikForm.reset();
            (document.getElementById('balikMnozstvi') as HTMLInputElement).value = '1';
            vykresliVozidlo();
        } else {
            zobrazHlasku('Chyba: ' + vysledek.reason, 'error');
        }
    } catch (err) {
        const text = err instanceof Error ? err.message : 'Neznama chyba'; // pokud dojde k chybě při vytváření balíku, zobrazí se chybová hláška s textem chyby
        zobrazHlasku('Chyba: ' + text, 'error');
    }
};
// Inicializace zobrazení vozidla po načtení stránky
vykresliVozidlo();