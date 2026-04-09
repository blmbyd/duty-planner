# Duty Planner

Duty Planner to aplikacja webowa typu local-first do sprawiedliwego planowania powtarzalnych dyżurów w zespole. Pozwala zdefiniować uczestników, oznaczyć osoby z kluczami, ustawić zakres planowania, uwzględnić historyczne dyżury i wygenerować harmonogram, który rozkłada obciążenie możliwie równomiernie w całej grupie.

Aplikacja została zbudowana przy użyciu Reacta, TypeScriptu, Vite, Tailwind CSS oraz komponentów UI opartych na Radix. Wszystkie dane robocze są przechowywane w przeglądarce i mogą zostać wyeksportowane lub przywrócone z kopii zapasowej w formacie JSON.

<img width="1298" height="1228" alt="image" src="https://github.com/user-attachments/assets/deeeecc9-64da-40bc-b3c4-6d6083be6f14" />

## Co robi aplikacja

- Zarządza uczestnikami wraz z imieniem, nazwiskiem i statusem posiadacza kluczy.
- Generuje harmonogramy dla cyklu codziennego, co 2 dni, co 3 dni lub cotygodniowego.
- Wymaga obecności co najmniej jednej osoby z kluczami na każdym zwykłym dyżurze.
- Obsługuje comiesięczne dni specjalne, takie jak drugi poniedziałek albo ostatni piątek miesiąca, z własną liczbą osób na dyżurze.
- Uwzględnia historyczne dyżury, aby wcześniejsze przydziały wpływały na przyszłe wyrównanie obciążenia. Wpisy z kolekcji historycznej należą do odrębnego zbioru wejściowego generatora i są przechowywane osobno w local storage.
- Pozwala dodać dyżur ręcznie na dowolną datę — z przeszłości lub przyszłości — jako równorzędny wpis harmonogramu: blokuje ten termin, uczestniczy w obliczaniu sprawiedliwości i zachowuje się identycznie jak dyżur wygenerowany automatycznie.
- Umożliwia ręczne oznaczenie wybranych dat jako **dni wolnych** (bez dyżuru). Dni wolne są pomijane przez generator — żaden dyżur nie jest tworzony na tak oznaczonej dacie — i nie wpływają na statystyki sprawiedliwości obciążeń uczestników.
- Umożliwia przypisanie **nieobecności** do konkretnej osoby w formie pojedynczego dnia lub ciągłego zakresu dat od-do. Nieobecności są widoczne przy każdym uczestniku w panelu uczestników. Generator twardо wyklucza nieobecną osobę z puli kandydatów w dniach objętych jej nieobecnością — zarówno podczas standardowego generowania, jak i w trybie uzupełniania brakujących osób. Nieobecności są usuwane kaskadowo po usunięciu uczestnika.
- Umożliwia edycję składu uczestników i powiązanego dnia specjalnego dowolnego dyżuru: historycznego lub planowanego — bez zmiany daty dyżuru. Jeśli w ustawieniach zdefiniowano co najmniej jeden dzień specjalny, formularz edycji wyświetla listę wyboru umożliwiającą przypisanie lub odłączenie dnia specjalnego od dyżuru.
- Umozliwia uzupelnienie obsady dowolnego **biezacego lub przyszlego** wpisu w harmonogramie za pomoca przycisku "Uzupelnij dzien" widocznego w wierszu tabeli — dopisuje tylko brakujace osoby bez zmiany pozostalych dni i bez nadpisywania juz przypisanych osob. Przycisk jest nedostepny dla wpisow historycznych oraz wpisow z data wczesniejsza niz dzisiaj.
- Blokuje dodanie dyżuru, jeśli dana data jest już zajęta w harmonogramie.
- Zachowuje istniejące wpisy harmonogramu i przy ponownym generowaniu uzupełnia tylko brakujące daty.
- Oferuje dwa tryby uzupełniania harmonogramu: domyślny tryb ignoruje istniejące pozycje i dodaje tylko nowe daty, a tryb uzupełniania brakujących osób wykrywa niekompletne dyżury i dopisuje do nich brakującą obsadę (osoby z kluczami i dodatkowych uczestników).
- Pokazuje lekkie statystyki udziału uczestników dla dyżurów planowanych i historycznych.
- Eksportuje i importuje pełny stan aplikacji jako JSON.
- Umożliwia wygenerowanie wydruku harmonogramu jako osobna strona HTML — otwierana w nowej karcie przeglądarki — obejmującego dyżury planowane, historyczne i dni wolne z zakresu dat skonfigurowanego w ustawieniach, wraz z nagłówkiem zawierającym metadane okresu i częstotliwości.

## Główny przebieg pracy

1. Dodaj uczestników i oznacz przynajmniej jedną osobę jako posiadacza kluczy.
2. Skonfiguruj częstotliwość dyżurów, liczbę osób na dyżurze oraz zakres dat.
3. Opcjonalnie zdefiniuj powtarzalne dni specjalne z inną liczbą osób.
4. Opcjonalnie dodaj historyczne dyżury, aby zachować ciągłość sprawiedliwego rozkładu.
5. Opcjonalnie dodaj dyżury na konkretne daty (w przeszłości lub przyszłości) za pomocą przycisku "Dodaj dyżur" — wpisy te trafiają do wspólnego harmonogramu i są chronione przed nadpisaniem przez generator.
6. Opcjonalnie oznacz wybrane daty jako dni wolne, aby generator je pominął.
7. Opcjonalnie przypisz nieobecności wybranym uczestnikom (pojedynczy dzień lub zakres od-do) za pomocą ikony kalendarza widocznej przy każdej osobie w panelu uczestników.
8. Opcjonalnie uzupelnij obsade wybranego biezacego lub przyszlego dyzuru za pomoca przycisku "Uzupelnij dzien" w wierszu tabeli — przycisk dopisuje brakujaca obsluge bez zmiany pozostalych dni. Przycisk nie jest dostepny dla wpisow historycznych ani dla wpisow z data przeszla.
9. Opcjonalnie edytuj sklad uczestnikow i powiazany dzien specjalny dowolnego istniejacego dyzuru za pomoca przycisku olowka przy wierszu w tabeli harmonogramu.
10. Wygeneruj lub uzupełnij harmonogram.
12. Opcjonalnie otwórz widok do wydruku za pomocą przycisku "Drukuj" w panelu harmonogramu — wydruk obejmuje zaplanowane dyżury, historyczne dyżury i dni wolne z bieżącego zakresu dat ustawień.
13. W razie potrzeby wyeksportuj stan do pliku kopii zapasowej.

## Zasady planowania

Generator jest celowo pragmatyczny, a nie w pełni deterministyczny:

- Blokuje generowanie, gdy uczestników jest mniej niż wymagana liczba osób na dyżurze.
- Blokuje generowanie, gdy na liście uczestników nie ma żadnej osoby z kluczami.
- Wykorzystuje istniejące wpisy harmonogramu i dodaje tylko brakujące wymagane daty.
- W trybie uzupełniania brakujących osób sprawdza, czy każdy istniejący dyżur ma właściwy skład: zwykły dyżur wymaga co najmniej jednej osoby z kluczami i wymaganej liczby uczestników, dzień specjalny wymaga liczby osób zgodnej z konfiguracją. Niekompletne dyżury są uzupełniane bez zmiany już przypisanych uczestników.
- Łączy dyżury historyczne i już zaplanowane podczas obliczania sprawiedliwości przydziału.
- Wyklucza daty zajęte przez istniejące wpisy harmonogramu z puli generowanych terminów — żaden istniejący wpis nie jest nadpisywany.
- Wyklucza daty oznaczone jako dni wolne z puli generowanych terminów. Dzień wolny ma wyższy priorytet niż dzień specjalny: jeśli dzień specjalny wypada na datę oznaczoną jako wolna, generator nie tworzy tam żadnego dyżuru.
- Wyklucza nieobecnych uczestników z puli kandydatów na konkretną datę. Nieobecność ma charakter twardej blokady — obowiązuje zarówno w standardowym generowaniu, jak i w trybie uzupełniania brakujących osób. Blokada dotyczy również fallbackowych ścieżek wyboru kandydatów.
- Tworzy wiele kandydatów harmonogramu i zachowuje najlepiej oceniony wynik.
- Przy ocenie każdego kandydata punktuje trzy kryteria: minimalne odstępy między dyżurami tej samej osoby, różnorodność par uczestników oraz równomierność przydziałów do dni specjalnych osobno dla każdego typu dnia specjalnego.
- Preferuje osoby z mniejszą liczbą przydziałów i w miarę możliwości unika natychmiastowych powtórzeń tych samych osób.
- Dodaje wystąpienia dni specjalnych do zbioru wymaganych dat nawet wtedy, gdy nie wynikają one z bazowej częstotliwości.

## Trwałość danych

- Bieżące dane są przechowywane w local storage przeglądarki.
- Eksport tworzy wersjonowany plik kopii zapasowej JSON o nazwie w stylu `duty-planner-backup-YYYY-MM-DD.json`.
- Eksport zawiera uczestników, ustawienia, planowany harmonogram, historyczne dyżury, dni wolne oraz nieobecności uczestników.
- Import przywraca uczestników, ustawienia, planowany harmonogram, historyczne dyżury i dni wolne.
- Import całkowicie zastępuje bieżący stan zapisany w przeglądarce.
- Pliki eksportowane w poprzednich wersjach aplikacji (z polem `manualShifts`, bez `offDays` lub bez `participantAbsences`) są nadal obsługiwane — wpisy z `manualShifts` są automatycznie scalane do wspólnego harmonogramu, a brakujące pola uzupełniane pustymi tablicami.
- Preferencja językowa jest przechowywana oddzielnie w local storage pod kluczem `duty-planner:v1:language`.
- Wydruk harmonogramu generuje osobną stronę HTML otwieraną w nowej karcie przeglądarki; strona zawiera tabelę dyżurów dla bieżącego zakresu dat z ustawień, nagłówek z metadanymi i osadzony CSS dostosowany do druku — niezależnie od backupu JSON.

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
