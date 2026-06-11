# Expedice Zásilek (Logistický Systém)

Jednoduchá a moderní webová aplikace v **TypeScriptu** pro správu nákladu a expedici zásilek. Aplikace umožňuje simulovat nakládání balíků a dopisů do expedičního vozidla, automaticky hlídá kapacitní limity (objem a váhu) a dynamicky počítá celkovou cenu dopravy.

## Funkce aplikace

- **Správa vozidla:** Zobrazení názvu, celkového počtu kusů, zaplněného objemu a celkové ceny.
- **Kapacitní graf (Progress bar):** Dynamicky mění barvu podle zaplnění dodávky.
- **Validace a limity:** Automatické násobení váhy a objemu množstvím kusů. Systém nepovolí naložit zásilku, která by překročila globální limity vozidla.
- **Přehledný seznam nákladu:** Zobrazení naložených položek v responzivní kartě s odlišením křehkého zboží (jemné žluté podbarvení) a specifickými štítky pro nadměrné náklady.
- **Odebírání zásilek:** Možnost kdykoliv vyložit konkrétní zásilku z nákladového prostoru kliknutím na tlačítko.

## DŮLEŽITÉ: Jak aplikaci spustit lokálně

Protože aplikace využívá moderní JavaScriptové moduly (`import` / `export`), **nelze** soubor `index.html` spustit pouhým dvojklikem z disku (prohlížeč by zablokoval načítání kvůli bezpečnostní politice CORS).

**Je tedy potřeba spustit stránku přes VS Code Live Server nebo využít GitHub Pages: https://kubaroztocil.github.io/ExpediceZasilek/**
