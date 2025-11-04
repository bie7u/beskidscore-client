# Dokumentacja Kategorii Blogowych

## Czym są kategorie?

Kategorie blogowe to sposób na organizację i klasyfikację wpisów blogowych. Każdy wpis może być przypisany do jednej lub wielu kategorii, co ułatwia użytkownikom filtrowanie i znajdowanie treści na określone tematy.

### Przykłady kategorii:
- **Relacje z meczów** - relacje na żywo i podsumowania meczów
- **Transfery** - wiadomości o transferach piłkarskich
- **Analiza taktyczna** - głębsze analizy taktyczne i strategiczne
- **Wywiady** - wywiady z zawodnikami, trenerami i innymi postaciami
- **Zapowiedzi** - zapowiedzi nadchodzących meczów i wydarzeń
- **Historia** - artykuły historyczne o klubach i piłce nożnej

## Struktura danych kategorii

Każda kategoria składa się z trzech głównych pól:

```typescript
interface BlogCategory {
  id: number;        // Unikalny identyfikator kategorii
  name: string;      // Czytelna nazwa kategorii (np. "Relacje z meczów")
  slug: string;      // URL-friendly wersja nazwy (np. "relacje-z-meczy")
}
```

### Przykład danych:
```json
{
  "id": 1,
  "name": "Relacje z meczów",
  "slug": "relacje-z-meczy"
}
```

## Co to jest slug?

**Slug** to URL-friendly wersja nazwy kategorii, która jest używana w adresach URL. Slug jest automatycznie generowany z nazwy kategorii przez backend.

### Jak działa konwersja nazwy na slug:

1. **Konwersja znaków specjalnych:**
   - Polskie znaki diakrytyczne są zamieniane na ich odpowiedniki łacińskie
   - `ą → a`, `ć → c`, `ę → e`, `ł → l`, `ń → n`, `ó → o`, `ś → s`, `ź → z`, `ż → z`

2. **Konwersja na małe litery:**
   - Wszystkie znaki są zamieniane na małe litery

3. **Zastępowanie spacji:**
   - Spacje są zastępowane myślnikami (`-`)

4. **Usuwanie niedozwolonych znaków:**
   - Wszystkie znaki niebędące literami, cyframi ani myślnikami są usuwane

### Przykłady konwersji:

| Nazwa kategorii | Slug |
|----------------|------|
| "Relacje z meczów" | "relacje-z-meczy" |
| "Transfery" | "transfery" |
| "Analiza taktyczna" | "analiza-taktyczna" |
| "Wywiady z zawodnikami" | "wywiady-z-zawodnikami" |

### Po co slug?

Slug jest używany w adresach URL, dzięki czemu:
- **URL jest czytelny**: `/blog/kategoria/relacje-z-meczy` zamiast `/blog/kategoria/1`
- **SEO-friendly**: Wyszukiwarki lepiej indeksują strony z czytelnymi URL-ami
- **Bezpieczeństwo**: Unika problemów z kodowaniem znaków specjalnych w URL

## Jak działają kategorie w systemie?

### 1. Tworzenie kategorii

Kategorie można tworzyć na dwa sposoby:

#### A. W panelu zarządzania kategoriami:
- Przejdź do **Admin Dashboard** → **Zarządzanie kategoriami**
- Kliknij przycisk **"Dodaj kategorię"**
- Wpisz nazwę kategorii (np. "Analiza taktyczna")
- System automatycznie wygeneruje slug (np. "analiza-taktyczna")

#### B. Bezpośrednio w edytorze wpisu:
- Podczas tworzenia/edycji wpisu
- Kliknij **"Dodaj kategorię"** w sekcji kategorii
- Wpisz nazwę i kliknij **"Utwórz"**
- Nowa kategoria zostanie automatycznie dodana i zaznaczona dla bieżącego wpisu

### 2. Przypisywanie kategorii do wpisu

Podczas tworzenia lub edycji wpisu blogowego:

1. W sekcji **"Kategorie"** zobaczysz listę dostępnych kategorii
2. Możesz wybrać **wiele kategorii** dla jednego wpisu
3. Zaznacz checkboxy przy kategoriach, które pasują do twojego wpisu
4. Zaznaczone kategorie pojawią się jako "tagi" pod listą kategorii
5. Możesz usunąć kategorię klikając "X" przy tagu

### 3. Filtrowanie wpisów po kategoriach

Użytkownicy mogą przeglądać wpisy według kategorii:
- URL: `/blog/kategoria/{slug}` (np. `/blog/kategoria/transfery`)
- Kliknięcie w kategorię na liście wpisów
- Filtr kategorii w interfejsie użytkownika

## Integracja z API

### Endpoint: GET /api/categories/
Pobiera listę wszystkich kategorii.

**Odpowiedź:**
```json
[
  {
    "id": 1,
    "name": "Relacje z meczów",
    "slug": "relacje-z-meczy"
  },
  {
    "id": 2,
    "name": "Transfery",
    "slug": "transfery"
  }
]
```

### Endpoint: POST /api/categories/
Tworzy nową kategorię.

**Zapytanie:**
```json
{
  "category": "Nowa kategoria"
}
```

**Odpowiedź:**
```json
{
  "id": 7,
  "name": "Nowa kategoria",
  "slug": "nowa-kategoria"
}
```

### Endpoint: PUT /api/categories/{id}/
Aktualizuje istniejącą kategorię.

**Zapytanie:**
```json
{
  "category": "Zaktualizowana nazwa"
}
```

**Odpowiedź:**
```json
{
  "id": 7,
  "name": "Zaktualizowana nazwa",
  "slug": "zaktualizowana-nazwa"
}
```

### Endpoint: DELETE /api/categories/{id}/
Usuwa kategorię.

## Integracja z wpisami blogowymi

### Tworzenie wpisu z kategoriami

**Zapytanie POST /api/blog/:**
```json
{
  "title": "Tytuł wpisu",
  "content": "Treść wpisu...",
  "excerpt": "Krótki opis",
  "published": true,
  "categories": [1, 3, 5]  // Array z ID kategorii
}
```

### Aktualizacja kategorii wpisu

**Zapytanie PATCH /api/blog/{id}/:**
```json
{
  "categories": [2, 4]  // Nowa lista kategorii
}
```

### Pobieranie wpisów

**Odpowiedź GET /api/blog/{id}/:**
```json
{
  "id": 1,
  "title": "Tytuł wpisu",
  "slug": "tytul-wpisu",
  "content": "Treść...",
  "categories": [1, 3],  // Array z ID kategorii
  "category_name": "Relacje z meczów",  // Nazwa pierwszej kategorii (dla kompatybilności wstecznej)
  ...
}
```

## Przykłady użycia w kodzie

### Pobieranie kategorii:

```typescript
import { apiService } from './utils/apiService';

// Pobierz wszystkie kategorie
const categories = await apiService.getBlogCategories();
console.log(categories);
// [{ id: 1, name: "Relacje z meczów", slug: "relacje-z-meczy" }, ...]
```

### Tworzenie wpisu z kategoriami:

```typescript
const newEntry = {
  title: "Mój nowy wpis",
  content: "Treść wpisu...",
  excerpt: "Krótki opis",
  published: true,
  categories: [
    { id: 1, name: "Relacje z meczów", slug: "relacje-z-meczy" },
    { id: 3, name: "Analiza taktyczna", slug: "analiza-taktyczna" }
  ]
};

await apiService.createBlogEntry(newEntry);
```

### Filtrowanie po slug:

```typescript
// Pobierz wpisy dla kategorii o danym slug
const slug = "transfery";
const allEntries = await apiService.getBlogEntries();
const filteredEntries = allEntries.filter(entry => 
  entry.categories?.some(catId => {
    const category = categories.find(c => c.id === catId);
    return category?.slug === slug;
  })
);
```

## Najlepsze praktyki

### 1. Nazewnictwo kategorii:
- Używaj jasnych, zwięzłych nazw
- Unikaj zbyt długich nazw (maksymalnie 3-4 słowa)
- Bądź konsekwentny w stylu nazewnictwa

### 2. Liczba kategorii na wpis:
- Przypisuj 1-3 kategorie do wpisu
- Zbyt wiele kategorii utrudnia nawigację
- Wybieraj tylko najbardziej relevantne kategorie

### 3. Zarządzanie kategoriami:
- Regularnie przeglądaj i aktualizuj kategorie
- Usuwaj nieużywane kategorie
- Łącz podobne kategorie jeśli to możliwe

### 4. URL i routing:
- Slug jest używany w URL, więc powinien być:
  - Krótki i zwięzły
  - Opisowy
  - Unikalny
- Backend automatycznie generuje slug z nazwy

## Często zadawane pytania

**Q: Czy mogę zmienić slug kategorii?**  
A: Tak, ale zmiana slug zmieni również URL kategorii. Backend automatycznie regeneruje slug przy zmianie nazwy kategorii.

**Q: Co się stanie z wpisami jeśli usunę kategorię?**  
A: Wpisy pozostaną, ale stracą przypisanie do usuniętej kategorii. Upewnij się, że nie usuwasz kategorii używanych przez ważne wpisy.

**Q: Czy mogę mieć dwie kategorie o tej samej nazwie?**  
A: Nie, nazwy kategorii muszą być unikalne. Slug również musi być unikalny.

**Q: Jak wpływa to na SEO?**  
A: Używanie kategorii i slug-ów poprawia SEO poprzez:
- Strukturę URL przyjazną dla wyszukiwarek
- Lepszą organizację treści
- Łatwiejszą indeksację przez roboty wyszukiwarek

**Q: Czy slug jest case-sensitive?**  
A: Nie, slug zawsze jest konwertowany do małych liter.

**Q: Co jeśli dwie kategorie wygenerują ten sam slug?**  
A: Backend automatycznie doda sufiks numeryczny do drugiego slug-a (np. "transfery-2").

## Podsumowanie

Kategorie blogowe to potężne narzędzie do organizacji treści. Słowo "slug" to po prostu URL-friendly wersja nazwy kategorii, automatycznie generowana przez system. System obsługuje:

- ✅ Wiele kategorii na wpis
- ✅ Automatyczne generowanie slug
- ✅ Łatwe tworzenie i zarządzanie kategoriami
- ✅ Integrację z API
- ✅ SEO-friendly URL-e
