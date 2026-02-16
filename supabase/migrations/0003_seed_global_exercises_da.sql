insert into public.exercises (
  title,
  description,
  how_to,
  mode,
  metrics_type,
  numeric_unit,
  category,
  visibility,
  created_by
)
values
  (
    'Førsteberøring mod væg',
    'Træn førsteberøring og orientering med en væg som medspiller.',
    'Stil dig 3-5 meter fra en væg. Spil bolden mod væggen med indersiden. Tag førsteberøring væk fra ”pres” (fx til højre/venstre) og spil tilbage. Skift fod hver 10. aflevering.',
    'solo',
    'numeric',
    'reps',
    'førsteberøring',
    'global',
    null
  ),
  (
    'Pasningsserie: 50 sikre afleveringer',
    'Fokus på præcision, tempo og teknik.',
    'Mål 50 afleveringer mod en væg eller til en makker. Notér hvor mange der er ”gode” (rammer mål/zone) eller hvor mange i træk uden fejl.',
    'both',
    'numeric',
    'reps',
    'pasning',
    'global',
    null
  ),
  (
    'Driblebane mellem kegler',
    'Forbedr close control og retningsskift.',
    'Sæt 6-10 kegler med 1-1,5 meter mellemrum. Dribl igennem så hurtigt du kan uden at miste kontrol. Notér tid eller kvalitet.',
    'solo',
    'both',
    'seconds',
    'dribling',
    'global',
    null
  ),
  (
    'Afslutninger: 20 skud',
    'Fokus på afslutningsteknik og træfsikkerhed.',
    'Tag 20 afslutninger (fx efter førsteberøring). Notér antal på mål eller kvalitet (ok/god/mestret).',
    'both',
    'both',
    'count',
    'afslutning',
    'global',
    null
  ),
  (
    'Sprint 10 m (gentagelser)',
    'Acceleration fra stillestående.',
    'Marker 10 meter. Sprint 6-10 gange med fuld intensitet. Notér bedste tid eller gennemsnit.',
    'solo',
    'numeric',
    'seconds',
    'speed',
    'global',
    null
  ),
  (
    'Agility: retningsskift (5-10-5)',
    'Hurtige retningsskift og fodarbejde.',
    'Sæt 3 markører: midte, 5 meter til venstre, 5 meter til højre. Start i midten, løb 5 m til den ene side, 10 m til den anden, og tilbage 5 m til midten. Notér tid.',
    'solo',
    'numeric',
    'seconds',
    'agility',
    'global',
    null
  ),
  (
    'Jonglering',
    'Boldkontrol og rytme.',
    'Jonglér så mange gange som muligt uden at tabe bolden. Notér bedste antal (PB) og evt. kvalitet.',
    'solo',
    'numeric',
    'count',
    'boldkontrol',
    'global',
    null
  ),
  (
    'Styrke: planke',
    'Core-styrke og stabilitet.',
    'Hold planken med god teknik. Notér tid. Stop hvis teknik falder.',
    'solo',
    'numeric',
    'seconds',
    'styrke',
    'global',
    null
  );
