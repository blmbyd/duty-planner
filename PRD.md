# Dokument Wymagań Produktowych

## Nazwa produktu

Duty Planner

## Podsumowanie produktu

Duty Planner to aplikacja local-first do planowania powtarzalnych dyżurów w sposób sprawiedliwy i przejrzysty. Produkt pomaga zarządzać uczestnikami, zapewnić obecność osób z kluczami, zachować kontekst historycznych dyżurów i generować nowe wpisy harmonogramu bez nadpisywania tego, co zostało już zaplanowane.

Produkt jest przeznaczony dla małych i średnich zespołów wewnętrznych, które potrzebują szybkiego procesu planowania bez wprowadzania backendu, kont użytkowników i dodatkowej infrastruktury operacyjnej.

## Problem do rozwiązania

Zespoły dzielące między sobą cykliczne obowiązki często zarządzają przydziałami ręcznie w arkuszach lub w komunikatorach. Powoduje to trzy powtarzalne problemy:

- obciążenie z czasem przesuwa się na te same osoby,
- łatwo pominąć osoby posiadające klucze,
- rozszerzanie istniejącego harmonogramu jest żmudne i podatne na błędy.

Produkt ma ograniczyć ręczną koordynację i zapewnić powtarzalny, zrozumiały proces planowania.

## Cele

- Szybko tworzyć harmonogramy dyżurów na podstawie niewielkiego zestawu danych wejściowych.
- Utrzymywać możliwie wyrównany rozkład przydziałów w zespole.
- Gwarantować obecność osoby z kluczami na zwykłych dyżurach.
- Zachowywać kontekst historyczny, aby sprawiedliwość przydziału nie zaczynała się od zera przy każdym nowym okresie planowania.
- Pozwalać użytkownikowi rozszerzać istniejący harmonogram zamiast generować go od nowa.
- Zachowywać pełną przenośność danych przez import i eksport.

## Poza zakresem

- Współpraca wielu użytkowników
- Uwierzytelnianie i uprawnienia
- Synchronizacja z chmurą
- Przechowywanie danych po stronie serwera
- Ręczna edycja harmonogramu metodą przeciągnij i upuść
- Zaawansowane zarządzanie urlopami lub dostępnością
- Kompletne słowniki dla języków innych niż polski (infrastruktura i18n istnieje, ale drugi język nie jest dostarczony w tej iteracji)

## Użytkownicy docelowi

- Zespoły biurowe rotujące obowiązki wsparcia lub utrzymania
- Grupy współdzielące obowiązki w mieszkaniu, akademiku lub wspólnej przestrzeni
- Małe organizacje potrzebujące lekkiego narzędzia do planowania rotacyjnego

## Zasady produktowe

1. Zorganizowanie: przebieg pracy powinien prowadzić od uczestników przez ustawienia do generowania harmonogramu bez zbędnej niejednoznaczności.
2. Przejrzystość: użytkownik powinien rozumieć, dlaczego generowanie jest zablokowane i od jakich danych zależy wynik.
3. Pragmatyzm: aplikacja ma dostarczać szybko użyteczny rezultat zamiast rozbudowanego interfejsu optymalizacji.
4. Bezpieczne rozszerzanie: ponowne generowanie powinno uzupełniać luki, a nie niszczyć już wykonaną pracę planistyczną.

## Wymagania funkcjonalne

### 1. Zarządzanie uczestnikami

Użytkownik musi móc:

- dodać uczestnika z imieniem, nazwiskiem i statusem posiadacza kluczy,
- edytować istniejącego uczestnika,
- usunąć uczestnika,
- uzupełnić aplikację przykładowymi uczestnikami do szybkiego testowania.

Kryteria akceptacji:

- Dane uczestników są zapisywane lokalnie w przeglądarce.
- Interfejs wyraźnie odróżnia posiadaczy kluczy od pozostałych uczestników.
- Przy pustej liście uczestników pokazywana jest wskazówka, jaki powinien być następny krok.

### 2. Ustawienia dyżurów

Użytkownik musi móc skonfigurować:

- częstotliwość dyżurów: codziennie, co 2 dni, co 3 dni, raz w tygodniu,
- liczbę osób na dyżurze,
- datę początkową,
- datę końcową.

Kryteria akceptacji:

- Ustawienia są zapisywane lokalnie.
- Liczba osób na dyżurze nie może spaść poniżej 1.
- Generowanie jest blokowane, jeśli pula uczestników jest mniejsza niż wymagana liczebność dyżuru.

### 3. Dni specjalne

Użytkownik musi móc definiować cykliczne dni specjalne w skali miesiąca z określeniem:

- nazwy,
- wystąpienia dnia tygodnia w miesiącu: pierwszy, drugi, trzeci, czwarty, ostatni,
- dnia tygodnia: od poniedziałku do piątku,
- wymaganej liczby osób.

Kryteria akceptacji:

- Dni specjalne są przechowywane jako część ustawień.
- Wystąpienia dni specjalnych mieszczące się w wybranym zakresie dat są uwzględniane w zbiorze wymaganych dat harmonogramu.
- Dni specjalne mogą wymagać innej liczby osób niż zwykłe dyżury.

### 4. Dyżury ręczne i historyczne

Użytkownik musi móc dodawać i usuwać historyczne dyżury z przeszłości.
Użytkownik musi móc dodawać i usuwać ręczne dyżury na dowolną datę — z przeszłości lub przyszłości.

Kryteria akceptacji:

- Historyczne dyżury wpływają na sprawiedliwość przyszłego generowania harmonogramu.
- Ręczne dyżury blokują termin i są uwzględniane przez generator — data zajęta przez ręczny wpis nie jest generowana ponownie.
- Ręczne dyżury wpływają na obliczanie sprawiedliwości obciążeń uczestników.
- Dodanie ręcznego dyżuru na datę już zajętą w harmonogramie lub wśród istniejących ręcznych wpisów jest blokowane z czytelnym komunikatem błędu.
- Historyczne dyżury i ręczne dyżury są wizualnie odróżnione od siebie i od nadchodzących dyżurów planowanych.
- Oba typy danych są uwzględniane w eksporcie i imporcie.

### 5. Generowanie harmonogramu

Generator musi:

- sprawdzać, czy liczba uczestników jest wystarczająca,
- sprawdzać, czy istnieje co najmniej jedna osoba z kluczami,
- wyliczać wszystkie wymagane daty na podstawie bazowej częstotliwości i skonfigurowanych dni specjalnych,
- zachowywać wcześniej wygenerowane wpisy harmonogramu,
- dodawać wyłącznie brakujące dyżury,
- zwracać kompletny, uporządkowany harmonogram dla zadanego okresu.

Wymagania behawioralne:

- Zwykły dyżur powinien zawierać co najmniej jedną osobę z kluczami.
- Dobór kandydatów powinien preferować osoby z mniejszą łączną liczbą przydziałów.
- Osoby przydzielone niedawno powinny być obniżane priorytetowo, jeśli istnieją alternatywy.
- Dyżury historyczne i już zaplanowane powinny wpływać na wynik oceny harmonogramu.
- Generator powinien próbować wielu wariantów harmonogramu i zachowywać najlepszy dostępny wynik.

Kryteria akceptacji:

- Istniejące wpisy harmonogramu pozostają niezmienione po ponownym generowaniu.
- Nowe dyżury są dodawane wyłącznie dla brakujących dat.
- Wynikowy harmonogram jest posortowany chronologicznie.
- Użytkownik otrzymuje po generowaniu komunikat sukcesu, informacji albo błędu.

### 6. Przegląd harmonogramu

Użytkownik musi móc przeglądać połączoną listę dyżurów historycznych i planowanych.

Kryteria akceptacji:

- Każdy dyżur pokazuje datę, uczestników i status.
- Dni specjalne są oznaczane w harmonogramie.
- Użytkownik może usuwać pojedyncze dyżury z listy.

### 7. Statystyki

Produkt powinien dostarczać lekkie statystyki na poziomie uczestnika.

Kryteria akceptacji:

- Interfejs pokazuje łączną liczbę przydziałów dla każdego uczestnika.
- Do sum są wliczane zarówno dyżury historyczne, jak i planowane.
- Widoczny jest udział w dniach specjalnych.

### 8. Import i eksport kopii zapasowej

Użytkownik musi móc eksportować i importować pełny stan aplikacji jako JSON.

Kryteria akceptacji:

- Eksport zawiera uczestników, ustawienia, harmonogram i historyczne dyżury.
- Import obsługuje zarówno aktualny opakowany format kopii zapasowej, jak i zwykły obiekt danych dla zgodności.
- Niepoprawny JSON albo nieprawidłowa struktura zwraca czytelny komunikat błędu.
- Import całkowicie zastępuje bieżące dane lokalne.

### 9. Język interfejsu

Aplikacja musi obsługiwać wybór języka interfejsu.

Kryteria akceptacji:

- Wybór języka jest dostępny w panelu ustawień.
- Preferencja językowa jest zapisywana lokalnie w przeglądarce i trwa po odświeżeniu strony.
- Wszystkie teksty UI, komunikaty toast, formatowanie dat i nazwy dni tygodnia są pobierane ze słownika aktywnego języka.
- W bieżącej iteracji dostępny jest wyłącznie język polski; infrastruktura pozwala na dodanie kolejnych języków bez zmian w komponentach.

## Główny przepływ użytkownika

1. Użytkownik otwiera aplikację.
2. Użytkownik dodaje uczestników i oznacza osoby z kluczami.
3. Użytkownik ustawia częstotliwość, liczebność dyżuru i zakres dat.
4. Użytkownik opcjonalnie dodaje dni specjalne.
5. Użytkownik opcjonalnie dodaje historyczne dyżury.
6. Użytkownik generuje harmonogram.
7. Użytkownik przegląda wynikowe przydziały i statystyki.
8. Użytkownik eksportuje dane, jeśli chce zachować przenośną kopię zapasową.

## Przypadki brzegowe

- Zbyt mała liczba uczestników względem wymaganej liczby osób na dyżurze
- Brak osoby z kluczami w puli uczestników
- Brak brakujących dat przy ponownym generowaniu
- Niepoprawny JSON podczas importu
- Importowany plik bez wymaganych pól najwyższego poziomu
- Wystąpienia dni specjalnych wypadające poza wybranym zakresem dat
- Usunięcie uczestnika pozostawiające w zapisanych lub importowanych dyżurach nierozpoznane identyfikatory

## Wymagania UX

- Aplikacja powinna pozostać zrozumiała na jednym ekranie z dwoma głównymi kolumnami na większych wyświetlaczach.
- Puste stany powinny wyjaśniać następne sensowne działanie użytkownika.
- Blokujące walidacje powinny być pokazywane natychmiast przez komunikaty toast.
- Generowanie powinno mieć widoczny stan ładowania.
- Dyżury historyczne i planowane powinny być łatwe do rozróżnienia na pierwszy rzut oka.

## Ograniczenia techniczne

- Implementacja wyłącznie frontendowa
- Browser local storage jako domyślna warstwa trwałości danych
- Kopia zapasowa JSON jako mechanizm przenoszenia danych
- Kod oparty na React, TypeScript i środowisku deweloperskim Vite
- Infrastruktura i18n zaimplementowana bez zewnętrznych bibliotek; w bieżącej iteracji dostępny jest wyłącznie język polski

## Metryki sukcesu

- Nowy użytkownik może wygenerować poprawny harmonogram bez dodatkowej instrukcji w czasie krótszym niż 5 minut.
- Ponowne generowanie zachowuje istniejące dyżury i uzupełnia tylko luki.
- Użytkownik może odtworzyć wcześniej wyeksportowany stan bez ręcznych poprawek.
- Rozkład przydziałów pozostaje wizualnie wyrównany dla typowych rozmiarów zespołu.
