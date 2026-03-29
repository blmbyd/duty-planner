# Duty Planner

Duty Planner to aplikacja webowa typu local-first do sprawiedliwego planowania powtarzalnych dyżurów w zespole. Pozwala zdefiniować uczestników, oznaczyć osoby z kluczami, ustawić zakres planowania, uwzględnić historyczne dyżury i wygenerować harmonogram, który rozkłada obciążenie możliwie równomiernie w całej grupie.

Aplikacja została zbudowana przy użyciu Reacta, TypeScriptu, Vite, Tailwind CSS oraz komponentów UI opartych na Radix. Wszystkie dane robocze są przechowywane w przeglądarce i mogą zostać wyeksportowane lub przywrócone z kopii zapasowej w formacie JSON.

## Co robi aplikacja

- Zarządza uczestnikami wraz z imieniem, nazwiskiem i statusem posiadacza kluczy.
- Generuje harmonogramy dla cyklu codziennego, co 2 dni, co 3 dni lub cotygodniowego.
- Wymaga obecności co najmniej jednej osoby z kluczami na każdym zwykłym dyżurze.
- Obsługuje comiesięczne dni specjalne, takie jak drugi poniedziałek albo ostatni piątek miesiąca, z własną liczbą osób na dyżurze.
- Uwzględnia historyczne dyżury, aby wcześniejsze przydziały wpływały na przyszłe wyrównanie obciążenia.
- Zachowuje istniejące wpisy harmonogramu i przy ponownym generowaniu uzupełnia tylko brakujące daty.
- Pokazuje lekkie statystyki udziału uczestników dla dyżurów planowanych i historycznych.
- Eksportuje i importuje pełny stan aplikacji jako JSON.

## Główny przebieg pracy

1. Dodaj uczestników i oznacz przynajmniej jedną osobę jako posiadacza kluczy.
2. Skonfiguruj częstotliwość dyżurów, liczbę osób na dyżurze oraz zakres dat.
3. Opcjonalnie zdefiniuj powtarzalne dni specjalne z inną liczbą osób.
4. Opcjonalnie dodaj historyczne dyżury, aby zachować ciągłość sprawiedliwego rozkładu.
5. Wygeneruj lub uzupełnij harmonogram.
6. W razie potrzeby wyeksportuj stan do pliku kopii zapasowej.

## Zasady planowania

Generator jest celowo pragmatyczny, a nie w pełni deterministyczny:

- Blokuje generowanie, gdy uczestników jest mniej niż wymagana liczba osób na dyżurze.
- Blokuje generowanie, gdy na liście uczestników nie ma żadnej osoby z kluczami.
- Wykorzystuje istniejące wpisy harmonogramu i dodaje tylko brakujące wymagane daty.
- Łączy dyżury historyczne i już zaplanowane podczas obliczania sprawiedliwości przydziału.
- Tworzy wiele kandydatów harmonogramu i zachowuje najlepiej oceniony wynik.
- Preferuje osoby z mniejszą liczbą przydziałów i w miarę możliwości unika natychmiastowych powtórzeń tych samych osób.
- Dodaje wystąpienia dni specjalnych do zbioru wymaganych dat nawet wtedy, gdy nie wynikają one z bazowej częstotliwości.

## Trwałość danych

- Bieżące dane są przechowywane w local storage przeglądarki.
- Eksport tworzy wersjonowany plik kopii zapasowej JSON o nazwie w stylu `duty-planner-backup-YYYY-MM-DD.json`.
- Import przywraca uczestników, ustawienia, planowany harmonogram oraz historyczne dyżury.
- Import całkowicie zastępuje bieżący stan zapisany w przeglądarce.

## Uruchomienie lokalne

### Wymagania

- Node.js 20 lub nowszy
- npm

### Instalacja

```bash
npm install
```

### Uruchomienie serwera deweloperskiego

```bash
npm run dev
```

### Budowanie wersji produkcyjnej

```bash
npm run build
```

### Uruchomienie lintingu

```bash
npm run lint
```

## Struktura projektu

- `src/components` zawiera główne panele interfejsu i dialogi.
- `src/hooks` zawiera hooki zarządzające stanem opartym o local storage.
- `src/lib/schedule` zawiera logikę generowania harmonogramu, narzędzia do pracy z datami, scoring i obsługę dni specjalnych.
- `src/lib/backup.ts` zawiera logikę eksportu i importu danych.

## Aktualny zakres produktu

Projekt jest obecnie przeznaczony dla pojedynczego zespołu i działa wyłącznie w przeglądarce. Nie zawiera warstwy serwerowej, uwierzytelniania ani mechanizmów współpracy wielu użytkowników.
