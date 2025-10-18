# Fotball Turnering

Et program for å administrere fotball turneringer bygget med Next.js, Prisma og LiteSQL.

## Funksjoner

- **Lag administrasjon**: Opprett lag og legg til opptil 10 spillere per lag
- **Spiller administrasjon**: Hver spiller har et nummer og navn
- **Kamp administrasjon**: Opprett kamper mellom lag
- **Mål registrering**: Registrer mål under pågående kamper med spillernavn og valgfritt minutt

## Teknisk stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **LiteSQL** - Database
- **Tailwind CSS** - Styling

## Installasjon og oppsett

1. **Installer avhengigheter**:
   ```bash
   npm install
   ```

2. **Sett opp database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start utviklingsserver**:
   ```bash
   npm run dev
   ```

4. **Åpne i nettleseren**:
   Gå til [http://localhost:3000](http://localhost:3000)

## Bruk

### Opprett lag
1. Gå til "Lag" i navigasjonen
2. Klikk "Opprett nytt lag"
3. Fyll inn lagnavn
4. Legg til spillere (opptil 10 per lag)

### Opprett kamper
1. Gå til "Kamper" i navigasjonen
2. Klikk "Opprett ny kamp"
3. Velg hjemmelag og bortelag
4. Start kampen når den er klar

### Registrer mål
1. Gå til kampen som er "Pågår"
2. Velg spiller som skåret målet
3. Legg til minutt (valgfritt)
4. Klikk "Registrer mål"
4. Avslutt kampen når den er ferdig

## Database schema

- **Team**: Lag med navn
- **Player**: Spillere med navn, nummer og tilknytning til lag
- **Game**: Kamper med hjemmelag, bortelag og resultat
- **Goal**: Mål med spiller, lag og valgfritt minutt

## API endepunkter

- `GET/POST /api/teams` - Hent/opprett lag
- `GET /api/teams/[id]` - Hent spesifikt lag
- `POST /api/teams/[id]/players` - Legg til spiller til lag
- `DELETE /api/players/[id]` - Slett spiller
- `GET/POST /api/games` - Hent/opprett kamper
- `GET /api/games/[id]` - Hent spesifikk kamp
- `POST /api/games/[id]/start` - Start kamp
- `POST /api/games/[id]/finish` - Avslutt kamp
- `POST /api/games/[id]/goals` - Registrer mål

## Utvikling

```bash
# Start utviklingsserver
npm run dev

# Bygg for produksjon
npm run build

# Start produksjonsserver
npm start

# Lint kode
npm run lint

# Database verktøy
npx prisma studio  # Åpne database GUI
npx prisma db push # Push schema endringer
```
