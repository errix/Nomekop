# Nomekop slice 1 taxonomy (from Alakazam, 2026-09-18)
# Bake into first config module. Source: pokemontcg.io v2.

## Form unification
- Join key: `nationalPokedexNumbers` (all values for TAG TEAM / multi-Pokémon)
- Always require `supertype:"Pokémon"`
- Do NOT rely on `name:meowth*` alone (misses Detective Pikachu); name helps UX suggest
- Sample: `q=nationalPokedexNumbers:52`

### Strip for base token / keep as facets
Regional prefixes: Alolan, Galarian, Hisuian, Paldean
Mega/Primal: `M ` + `-EX` (subtype MEGA); modern `Mega ` + optional X/Y + ` ex`; Primal Kyogre/Groudon-EX
Forme/color in name or prefix; Therian/Incarnate NOT in name — bucket by dex only
GMax/DMax not in name — VMAX subtype; Eternamax in name
Paradox: subtypes Ancient/Future, not name prefixes
Owner prefixes, Detective Pikachu (dex), trailing δ / BREAK
Combat suffixes to strip: -EX -GX V VMAX VSTAR ex BREAK δ Forme suffixes TAG TEAM &

Recipe: filter Pokémon → bucket by dex → optional facets from prefixes/subtypes

## Art-forward INCLUDE (exact rarity strings)
Illustration Rare, Special Illustration Rare, Amazing Rare, Radiant Rare,
Rare Ultra, Ultra Rare, Rare Rainbow, Rare Secret,
Trainer Gallery Rare Holo (TG + Galarian Gallery),
Shiny Rare, Shiny Ultra Rare, Rare Shiny, Rare Shiny GX,
Mega Hyper Rare,
Hyper Rare ONLY if supertype Pokémon

Gallery set.ids: swsh9tg, swsh10tg, swsh11tg, swsh12tg, swsh12pt5gg (GG vs TG via set.id / number prefix)

## EXCLUDE
Energy; Common Uncommon Rare Rare Holo Double Rare; bare Promo unless rules;
Ancient/Future alone without art rarity; ACE SPEC / play Items unless scope expands

## Optional later (ask Eric): Classic Collection; promo art; all Rare Holo V/VMAX/VSTAR

## Uncertainties
Therian not in EN name; costume renames incomplete; sample MEGA_ATTACK_RARE / Futuristic Rare / Black White Rare before include; some alt arts Promo-only
