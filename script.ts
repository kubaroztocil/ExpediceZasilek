import {menu, PolozkaMenu} from "./data.js"; // import data.js
abstract class Zasilka {
    public id: number
    public typ: string
    public nazev: string
    public cena: number
    public mnozstvi: number;

    constructor(id: number, typ: string, nazev: string, cena: number, mnozstvi: number) {
        this.id = id;
        this.typ = typ;
        this.nazev = nazev;
        this.cena = cena;
        this.mnozstvi = mnozstvi; // Výchozí množství
    }
    abstract vypocitejCenu(): number;
}

// Potomek pro dopis
class DopisZasilka extends Zasilka {
    vypocitejCenu(): number {
        return this.cena * this.mnozstvi;
    }
}

// Potomek pro balík
class BalikZasilka extends Zasilka {
    public maxVaha: number;
    public Vaha: number;
    public krehky: boolean;
    public maxObjem: number;

    constructor(
    id: number,
    typ: string,
    nazev: string,
    cena: number,
    maxVaha: number,
    Vaha: number,
    maxObjem: number,
    mnozstvi: number = 1,
    krehky: boolean = false
) {
    if (Vaha > maxVaha) {
        throw new Error(`Váha ${Vaha}kg překračuje limit ${maxVaha}kg!`);
    }
    
    super(id, typ, nazev, cena, mnozstvi);
    this.maxVaha = maxVaha;
    this.Vaha = Vaha;
    this.maxObjem = maxObjem;
    this.krehky = krehky;
    }
    vypocitejCenu(): number {
        let priplatek = 0;
        if (this.krehky === true) {
            priplatek = 25*this.maxVaha; // příplatek za křehké zboží
        } else {
            priplatek = 0; // bez příplatku
        }
        return (this.cena + priplatek) * this.mnozstvi;
    }
}

class BalikZasilkaNadmerny extends BalikZasilka {
    constructor(
        id: number,
        typ: string,
        nazev: string,
        cena: number,
        maxVaha: number,
        Vaha: number,
        maxObjem: number,
        mnozstvi: number = 1,
        krehky: boolean = false
    ) {
        // Zavoláme super s maxVaha jako váhu, aby prošla validace bez limitu
        super(id, typ, nazev, cena, maxVaha, maxVaha, maxObjem, mnozstvi, krehky);
        // Poté nastavíme skutečnou váhu (neomezeně)
        this.Vaha = Vaha;
    }

    vypocitejCenu(): number {
        let priplatek = 0;
        if (this.krehky === true) {
            priplatek = 25 * this.maxVaha; // příplatek za křehké zboží
        }
        const nadmernyPriplatek = 50; // příplatek za nadměrný balík
        return (this.cena + priplatek + (this.Vaha * nadmernyPriplatek)) * this.mnozstvi;
    }
}


new DopisZasilka(1, 'dopis', 'Standardní dopis', 40, 2);
new BalikZasilka(3, 'balik', 'Malý balík', 90, 2, 1.5, 10000, 1, true);
new BalikZasilkaNadmerny(3, 'balik', 'Nadměrný balík', 90, 2, 100, 10000, 1, true);
