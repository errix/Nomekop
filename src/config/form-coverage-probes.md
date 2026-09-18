# Nomekop form-coverage probes (Alakazam / Eric via Ditto)
Catalog-driven: every listed form pill must appear even at count 0. Radiant never a pill.

## Must-pass probes
1. Charizard (6): Base, Mega Charizard X, Mega Charizard Y, Gigantamax
   - Base = Charizard* without M/Mega/VMAX; Mega X = Mega Charizard X ex or XY M Charizard-EX Dragon; Mega Y = Mega Charizard Y ex or XY M Charizard-EX Fire; Gmax = Charizard VMAX
   - Radiant Charizard in results, no Radiant pill
2. Meowth (52): Base, Alolan, Galarian, Gigantamax; signals Meowth / Alolan Meowth / Galarian Meowth / Meowth VMAX
3. Raichu (26): Base, Alolan, Mega Raichu X, Mega Raichu Y (Z-A Mega Dimension; Mega X/Y may be 0)
4. Ninetales (38): Base, Alolan
5. Lilligant (549): Base, Hisuian
6. Wooper (194): Base, Paldean (Clodsire separate dex — not a Wooper form pill)
7. Tauros (128): Base, Paldean (+ Combat/Blaze/Aqua only if breeds encoded as forms)
8. Deoxys (386): Normal / Attack / Defense / Speed Forme (all four always)
9. Kyurem (646): Base, Black, White
10. Landorus (645): Incarnate + Therian if mappable; else document API name gap
11. Urshifu (892): Single Strike, Rapid Strike
12. Pikachu (25): NEGATIVE — costume/owner must not create form pills; species search still unified
13. Eternatus (890): Base, Eternamax
14. Weedle (13): single-form control — only Base
15. Lucario (448): Base, Mega, Mega Z (Mega Z stub at 0; plain Mega must not match Mega Z)

## Global asserts
- Form pills ⊆ real forms only
- Missing hits ⇒ badge 0, pill still visible
- Never pills: Radiant, shiny/print, costume/owner, TAG TEAM, EX/GX/V/VSTAR/ex-as-form (VMAX only as Gmax stand-in)
