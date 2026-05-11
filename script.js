class Zasilka {
    id;
    typ;
    nazev;
    cena;
    mnozstvi;
    constructor(id, typ, nazev, cena, mnozstvi) {
        this.id = id;
        this.typ = typ;
        this.nazev = nazev;
        this.cena = cena;
        this.mnozstvi = mnozstvi; // Výchozí množství
    }
}
// Potomek pro dopis
class DopisZasilka extends Zasilka {
    vypocitejCenu() {
        return this.cena * this.mnozstvi;
    }
}
// Potomek pro balík
class BalikZasilka extends Zasilka {
    maxVaha;
    Vaha;
    krehky;
    maxObjem;
    constructor(id, typ, nazev, cena, maxVaha, Vaha, maxObjem, mnozstvi = 1, krehky = false) {
        if (Vaha > maxVaha) {
            throw new Error(`Váha ${Vaha}kg překračuje limit ${maxVaha}kg!`);
        }
        super(id, typ, nazev, cena, mnozstvi);
        this.maxVaha = maxVaha;
        this.Vaha = Vaha;
        this.maxObjem = maxObjem;
        this.krehky = krehky;
    }
    vypocitejCenu() {
        let priplatek = 0;
        if (this.krehky === true) {
            priplatek = 25 * this.maxVaha; // příplatek za křehké zboží
        }
        else {
            priplatek = 0; // bez příplatku
        }
        return (this.cena + priplatek) * this.mnozstvi;
    }
}
class BalikZasilkaNadmerny extends BalikZasilka {
    constructor(id, typ, nazev, cena, maxVaha, Vaha, maxObjem, mnozstvi = 1, krehky = false) {
        // Zavoláme super s maxVaha jako váhu, aby prošla validace bez limitu
        super(id, typ, nazev, cena, maxVaha, maxVaha, maxObjem, mnozstvi, krehky);
        // Poté nastavíme skutečnou váhu (neomezeně)
        this.Vaha = Vaha;
    }
    vypocitejCenu() {
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
export {};
