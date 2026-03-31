# Duty Planner

Duty Planner to aplikacja webowa typu local-first do sprawiedliwego planowania powtarzalnych dyżurów w zespole. Pozwala zdefiniować uczestników, oznaczyć osoby z kluczami, ustawić zakres planowania, uwzględnić historyczne dyżury i wygenerować harmonogram, który rozkłada obciążenie możliwie równomiernie w całej grupie.

Aplikacja została zbudowana przy użyciu Reacta, TypeScriptu, Vite, Tailwind CSS oraz komponentów UI opartych na Radix. Wszystkie dane robocze są przechowywane w przeglądarce i mogą zostać wyeksportowane lub przywrócone z kopii zapasowej w formacie JSON.

<img width="1298" height="1228" alt="image" src="https://github.com/user-attachments/assets/deeeecc9-64da-40bc-b3c4-6d6083be6f14" />

## Co robi aplikacja

- Zarządza uczestnikami wraz z imieniem, nazwiskiem i statusem posiadacza kluczy.
- Generuje harmonogramy dla cyklu codziennego, co 2 dni, co 3 dni lub cotygodniowego.
- Wymaga obecności co najmniej jednej osoby z kluczami na każdym zwykłym dyżurze.
- Obsługuje comiesięczne dni specjalne, takie jak drugi poniedziałek albo ostatni piątek miesiąca, z własną liczbą osób na dyżurze.
- Uwzględnia historyczne dyżury, aby wcześniejsze przydziały wpływały na przyszłe wyrównanie obciążenia.
- Pozwala ręcznie dodać dyżur na dowolną datę — z przeszłości lub przyszłości — który blokuje termin i wpływa na sprawiedliwość planowania.
- Umożliwia ręczne oznaczenie wybranych dat jako **dni wolnych** (bez dyżuru). Dni wolne są pomijane przez generator — żaden dyżur nie jest tworzony na tak oznaczonej dacie — i nie wpływają na statystyki sprawiedliwości obciążeń uczestników.
- Umożliwia edycję składu uczestników i powiązanego dnia specjalnego dowolnego dyżuru: ręcznego, historycznego lub wygenerowanego — bez zmiany daty dyżuru. Jeśli w ustawieniach zdefiniowano co najmniej jeden dzień specjalny, formularz edycji wyświetla listę wyboru umożliwiającą przypisanie lub odłączenie dnia specjalnego od dyżuru.
- Blokuje dodanie ręcznego dyżuru, jeśli dana data jest już zajęta w harmonogramie lub wśród wcześniej dodanych wpisów ręcznych.
- Zachowuje istniejące wpisy harmonogramu i przy ponownym generowaniu uzupełnia tylko brakujące daty.
- Oferuje dwa tryby uzupełniania harmonogramu: domyślny tryb ignoruje istniejące pozycje i dodaje tylko nowe daty, a tryb uzupełniania brakujących osób wykrywa niekompletne dyżury i dopisuje do nich brakującą obsadę (osoby z kluczami i dodatkowych uczestników).
- Pokazuje lekkie statystyki udziału uczestników dla dyżurów planowanych i historycznych.
- Eksportuje i importuje pełny stan aplikacji jako JSON.

## Główny przebieg pracy

1. Dodaj uczestników i oznacz przynajmniej jedną osobę jako posiadacza kluczy.
2. Skonfiguruj częstotliwość dyżurów, liczbę osób na dyżurze oraz zakres dat.
3. Opcjonalnie zdefiniuj powtarzalne dni specjalne z inną liczbą osób.
4. Opcjonalnie dodaj historyczne dyżury, aby zachować ciągłość sprawiedliwego rozkładu.
5. Opcjonalnie dodaj ręczne dyżury na konkretne daty (w przeszłości lub przyszłości), które mają być trwale wpisane w harmonogram i chronione przed nadpisaniem przez generator.
6. Opcjonalnie oznacz wybrane daty jako dni wolne, aby generator je pominął.
7. Opcjonalnie edytuj skład uczestników i powiązany dzień specjalny dowolnego istniejącego dyżuru za pomocą przycisku ołówka przy wierszu w tabeli harmonogramu.
7. Wygeneruj lub uzupełnij harmonogram.
8. W razie potrzeby wyeksportuj stan do pliku kopii zapasowej.

## Zasady planowania

Generator jest celowo pragmatyczny, a nie w pełni deterministyczny:

- Blokuje generowanie, gdy uczestników jest mniej niż wymagana liczba osób na dyżurze.
- Blokuje generowanie, gdy na liście uczestników nie ma żadnej osoby z kluczami.
- Wykorzystuje istniejące wpisy harmonogramu i dodaje tylko brakujące wymagane daty.
- W trybie uzupełniania brakujących osób sprawdza, czy każdy istniejący dyżur ma właściwy skład: zwykły dyżur wymaga co najmniej jednej osoby z kluczami i wymaganej liczby uczestników, dzień specjalny wymaga liczby osób zgodnej z konfiguracją. Niekompletne dyżury są uzupełniane bez zmiany już przypisanych uczestników.
- Łączy dyżury historyczne, ręczne i już zaplanowane podczas obliczania sprawiedliwości przydziału.
- Wyklucza daty zajęte przez ręczne dyżury z puli generowanych terminów — ręczne wpisy nie są nadpisywane.
- Wyklucza daty oznaczone jako dni wolne z puli generowanych terminów. Dzień wolny ma wyższy priorytet niż dzień specjalny: jeśli dzień specjalny wypada na datę oznaczoną jako wolna, generator nie tworzy tam żadnego dyżuru.
- Tworzy wiele kandydatów harmonogramu i zachowuje najlepiej oceniony wynik.
- Przy ocenie każdego kandydata punktuje trzy kryteria: minimalne odstępy między dyżurami tej samej osoby, różnorodność par uczestników oraz równomierność przydziałów do dni specjalnych osobno dla każdego typu dnia specjalnego.
- Preferuje osoby z mniejszą liczbą przydziałów i w miarę możliwości unika natychmiastowych powtórzeń tych samych osób.
- Dodaje wystąpienia dni specjalnych do zbioru wymaganych dat nawet wtedy, gdy nie wynikają one z bazowej częstotliwości.

## Trwałość danych

- Bieżące dane są przechowywane w local storage przeglądarki.
- Eksport tworzy wersjonowany plik kopii zapasowej JSON o nazwie w stylu `duty-planner-backup-YYYY-MM-DD.json`.
- Import przywraca uczestników, ustawienia, planowany harmonogram, historyczne dyżury, ręczne dyżury oraz dni wolne.
- Import całkowicie zastępuje bieżący stan zapisany w przeglądarce.
- Pliki eksportowane w poprzednich wersjach aplikacji (bez pola `manualShifts` lub `offDays`) są nadal obsługiwane — brakujące pola są uzupełniane pustą tablicą.
- Preferencja językowa jest przechowywana oddzielnie w local storage pod kluczem `duty-planner:v1:language`.

## Wielojęzyczność

Aplikacja zawiera wbudowaną infrastrukturę internacjonalizacji (i18n):

- Wszystkie teksty widoczne dla użytkownika, komunikaty toast i formatowanie dat są pobierane ze słowników tłumaczeń, a nie zakodowane bezpośrednio w komponentach.
- Wybór języka jest dostępny w panelu ustawień i jest zapisywany lokalnie w przeglądarce.
- W tej iteracji dostępny jest wyłącznie **język polski** jako jedyny kompletny słownik.
- Dodanie kolejnego języka wymaga wyłącznie:
  1. Dodania nowego pliku słownika w `src/lib/i18n/` implementującego interfejs `Translations`,
  2. Rozszerzenia unii typów `AppLanguage` o nowy kod języka,
  3. Rejestracji słownika w mapie `TRANSLATIONS` oraz etykiety w `LANGUAGE_LABELS` w `src/lib/i18n/index.tsx`.

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
- `src/lib/i18n` zawiera infrastrukturę wielojęzyczności: typy, słowniki i provider kontekstu językowego.

## Aktualny zakres produktu

Projekt jest obecnie przeznaczony dla pojedynczego zespołu i działa wyłącznie w przeglądarce. Nie zawiera warstwy serwerowej, uwierzytelniania ani mechanizmów współpracy wielu użytkowników.
