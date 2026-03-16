# Planning Guide

Aplikacja do inteligentnego planowania i optymalizacji dyżurów w grupie, zapewniająca równomierne rozłożenie obowiązków, maksymalizację odstępów między dyżurami oraz promowanie interakcji między wszystkimi uczestnikami.

**Experience Qualities**:
1. **Zorganizowana** - Aplikacja prowadzi użytkownika przez logiczny proces: najpierw definicja uczestników, potem ustawienia, na końcu generowanie harmonogramu
2. **Przejrzysta** - Wszystkie parametry i wygenerowane wyniki są jasno przedstawione, z wizualnymi wskazówkami dotyczącymi statusu uczestników
3. **Inteligentna** - Algorytm optymalizacyjny automatycznie dba o sprawiedliwe rozłożenie dyżurów i różnorodność zespołów

**Complexity Level**: Light Application (multiple features with basic state)
- Aplikacja ma kilka odrębnych funkcji (zarządzanie uczestnikami, konfiguracja parametrów, generowanie harmonogramu, eksport/import), ale operuje na stosunkowo prostej strukturze danych z perzystencją w KV store

## Essential Features

### Zarządzanie Uczestnikami
- **Functionality**: Dodawanie, edycja i usuwanie uczestników dyżurów z możliwością oznaczenia jako "osoba specjalna" (posiadacz kluczy)
- **Purpose**: Definiuje pulę osób dostępnych do dyżurów oraz identyfikuje kluczowe osoby, które muszą być zawsze obecne
- **Trigger**: Użytkownik klika "Dodaj uczestnika" lub edytuje istniejącego
- **Progression**: Klik na przycisk → Dialog z formularzem → Wprowadzenie imienia i nazwiska → Opcjonalne zaznaczenie "Posiada klucze" → Zapisanie → Pojawienie się na liście uczestników
- **Success criteria**: Lista uczestników jest zapisana w KV store, widoczna na ekranie, z wizualnymi wskaźnikami dla osób specjalnych

### Konfiguracja Parametrów Dyżurów
- **Functionality**: Ustawienie częstotliwości dyżurów (codziennie/co 2 dni/co 3 dni/raz w tygodniu), liczby osób na dyżurze, zakresu dat
- **Purpose**: Dostosowanie systemu do specyficznych potrzeb organizacyjnych
- **Trigger**: Użytkownik wypełnia formularz konfiguracyjny
- **Progression**: Wybór częstotliwości z dropdown → Ustawienie liczby osób na dyżurze (slider/input) → Wybór daty początkowej i końcowej → Automatyczna walidacja
- **Success criteria**: Parametry są zapisane, aplikacja pokazuje przewidywaną liczbę dyżurów na podstawie ustawień

### Generator Harmonogramu
- **Functionality**: Algorytm generujący optymalny harmonogram dyżurów z uwzględnieniem wszystkich ograniczeń
- **Purpose**: Automatyczne stworzenie sprawiedliwego rozkładu dyżurów
- **Trigger**: Kliknięcie przycisku "Generuj harmonogram"
- **Progression**: Klik → Walidacja danych → Uruchomienie algorytmu → Wyświetlenie wygenerowanego harmonogramu w formie tabeli/kalendarza → Toast z potwierdzeniem
- **Success criteria**: 
  - Każdy dyżur ma wymaganą liczbę osób
  - Co najmniej jedna osoba specjalna jest na każdym dyżurze
  - Odstępy między dyżurami tej samej osoby są maksymalizowane
  - Składy dyżurów są zróżnicowane (minimalizacja powtórzeń)
  - Harmonogram jest zapisany w KV store

### Eksport i Import JSON
- **Functionality**: Możliwość zapisu całej konfiguracji (uczestnicy + ustawienia + harmonogram) do pliku JSON oraz wczytania z pliku
- **Purpose**: Persystencja danych poza aplikacją, możliwość archiwizacji i udostępniania
- **Trigger**: Kliknięcie "Eksportuj do JSON" lub "Importuj z JSON"
- **Progression Export**: Klik → Pobranie pliku JSON z nazwą zawierającą datę → Toast z potwierdzeniem
- **Progression Import**: Klik → Wybór pliku → Parsowanie JSON → Walidacja → Załadowanie danych → Toast z potwierdzeniem lub błędem
- **Success criteria**: Plik JSON zawiera wszystkie dane, import przywraca stan aplikacji identyczny do stanu przed eksportem

### Podgląd Harmonogramu
- **Functionality**: Wizualizacja wygenerowanego harmonogramu w formacie tabeli z datami, uczestnikami i wskaźnikami
- **Purpose**: Czytelna prezentacja wyników dla użytkownika
- **Trigger**: Po wygenerowaniu harmonogramu
- **Progression**: Automatyczne wyświetlenie → Możliwość scrollowania → Wyróżnienie osób specjalnych
- **Success criteria**: Każdy dyżur jest wyraźnie wyświetlony z datą i listą uczestników

## Edge Case Handling

- **Za mało uczestników**: Jeśli liczba uczestników jest mniejsza niż wymagana liczba osób na dyżurze, wyświetl ostrzeżenie i zablokuj generowanie
- **Brak osób specjalnych**: Jeśli nie ma żadnej osoby oznaczonej jako specjalna, ale algorytm wymaga jej obecności, wyświetl ostrzeżenie z sugestią dodania osoby specjalnej
- **Za krótki okres**: Jeśli zakres dat jest zbyt krótki na choć jeden dyżur, wyświetl komunikat z minimalnym wymaganym okresem
- **Nieprawidłowy JSON**: Podczas importu waliduj strukturę i wyświetl szczegółowy komunikat błędu, jeśli dane są nieprawidłowe
- **Niemożliwa optymalizacja**: Jeśli parametry uniemożliwiają stworzenie harmonogramu (np. 10 dyżurów, 2 osoby specjalne, 3 osoby na dyżur), poinformuj użytkownika o konflikcie
- **Pusta lista uczestników**: Zablokuj przycisk generowania i wyświetl komunikat o konieczności dodania uczestników

## Design Direction

Aplikacja powinna być profesjonalna, zorganizowana i wzbudzać zaufanie - użytkownicy polegają na niej w kwestii sprawiedliwego podziału obowiązków. Design powinien być funkcjonalny, z wyraźną hierarchią informacji i stonowaną paletą kolorów sugerującą kompetencję i rzetelność.

## Color Selection

Paleta kolorów inspirowana profesjonalnymi narzędziami do zarządzania projektami, z akcentem na niebieski (zaufanie, organizacja) i zielony (sukces, optymalizacja).

- **Primary Color**: Głęboki niebieski `oklch(0.45 0.15 250)` - reprezentuje profesjonalizm, strukturę i zaufanie do systemu
- **Secondary Colors**: 
  - Jasny szary `oklch(0.96 0.005 250)` dla tła sekcji
  - Ciemny szary `oklch(0.35 0.01 250)` dla tekstu
- **Accent Color**: Żywy zielony `oklch(0.65 0.18 145)` dla wskaźników sukcesu, osób specjalnych i akcji generowania
- **Foreground/Background Pairings**: 
  - Background (Jasny białawy #FAFAFA): Ciemny tekst (#2C2C2E) - Ratio 14.2:1 ✓
  - Primary (Niebieski #2563EB): Biały tekst (#FFFFFF) - Ratio 6.1:1 ✓
  - Accent (Zielony #10B981): Biały tekst (#FFFFFF) - Ratio 4.8:1 ✓
  - Card (Biały #FFFFFF): Ciemny tekst (#2C2C2E) - Ratio 15.1:1 ✓

## Font Selection

Nowoczesny, czytelny typeface z charakterem technicznym, podkreślający precyzję i organizację systemu - **IBM Plex Sans** dla interfejsu i **JetBrains Mono** dla danych liczbowych i dat.

- **Typographic Hierarchy**:
  - H1 (Tytuł aplikacji): IBM Plex Sans Bold / 32px / tight letter-spacing
  - H2 (Nagłówki sekcji): IBM Plex Sans Semibold / 24px / normal letter-spacing
  - H3 (Tytuły kart): IBM Plex Sans Medium / 18px / normal letter-spacing
  - Body (Tekst główny): IBM Plex Sans Regular / 16px / line-height 1.6
  - Labels: IBM Plex Sans Medium / 14px / slight letter-spacing
  - Data/Numbers: JetBrains Mono Regular / 14px / tabular-nums

## Animations

Animacje powinny wspierać poczucie responsywności i "inteligencji" aplikacji - subtelne przejścia między stanami, delikatne animacje podczas generowania harmonogramu (sugerujące "pracę" algorytmu) oraz satysfakcjonujące potwierdzenia akcji.

- Przejścia między krokami: 300ms ease-out
- Pojawianie się elementów listy: staggered fade-in (50ms delay między elementami)
- Generowanie harmonogramu: pulsująca animacja przycisku + progress indicator
- Toast notifications: slide-in z prawej strony z gentle bounce
- Hover states: 150ms color/scale transitions

## Component Selection

- **Components**:
  - `Card` dla sekcji uczestników, ustawień i harmonogramu
  - `Dialog` dla dodawania/edycji uczestników
  - `Button` z wariantami (default, outline, ghost, destructive)
  - `Input` i `Label` dla formularzy
  - `Select` dla częstotliwości dyżurów
  - `Slider` dla liczby osób na dyżurze
  - `Switch` dla oznaczania osób specjalnych
  - `Table` dla wyświetlania harmonogramu
  - `Badge` dla statusów (osoba specjalna, liczba dyżurów)
  - `Calendar` dla wyboru zakresu dat
  - `ScrollArea` dla długich list
  - `Sonner` toast dla powiadomień
  - `Separator` dla wizualnego podziału sekcji

- **Customizations**:
  - Niestandardowy komponent `ParticipantCard` łączący avatar, imię i nazwisko, badge dla osoby specjalnej
  - `ScheduleTimeline` - wizualizacja harmonogramu z kolorowymi wskaźnikami
  - `StatCard` - podsumowanie statystyk (liczba dyżurów, średni odstęp)

- **States**:
  - Przyciski mają wyraźny hover (scale 1.02) i active state (scale 0.98)
  - Input fields z focus ring w kolorze primary
  - Disabled state dla przycisków gdy dane są niepełne
  - Loading state podczas generowania harmonogramu
  - Empty state dla pustej listy uczestników i harmonogramu

- **Icon Selection**:
  - `Users` - dla sekcji uczestników
  - `CalendarDots` - dla harmonogramu
  - `Gear` - dla ustawień
  - `Download/Upload` - dla eksportu/importu
  - `Plus` - dodawanie uczestnika
  - `Key` - osoba specjalna
  - `ArrowsClockwise` - generowanie harmonogramu
  - `Check` - potwierdzenia
  - `Warning` - ostrzeżenia

- **Spacing**:
  - Sekcje główne: `gap-8` (32px)
  - Wewnątrz kart: `gap-6` (24px)
  - Elementy formularza: `gap-4` (16px)
  - Listy: `gap-3` (12px)
  - Padding kart: `p-6` (24px)
  - Padding przycisków: `px-6 py-3`

- **Mobile**:
  - Układ stackowany (kolumny zamiast rzędów)
  - Harmonogram jako karty zamiast tabeli
  - Bottom sheet zamiast dialogów
  - Większe touch targets (min 44px)
  - Sticky header z tytułem i akcjami
  - Redukcja padding na mniejszych ekranach (`p-4` zamiast `p-6`)
