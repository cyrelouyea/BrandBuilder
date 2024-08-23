# Void Stranger Components

## Level editor

Build your own Void Stranger level!

Mechanics supported:
- Tiles:
  - [x] Rod
  - [ ] Memory
  - [x] Sword
  - [x] Wings
  - [ ] Endless rod
  - [x] Normal
  - [x] Stairs
  - [x] Empty
  - [x] Glass
  - [x] Bomb / Explo
  - [x] Switch / Locked Stairs
  - [x] Copy
  - [ ] Death 
- Statues:
  - [x] Boulder
  - [ ] Voider
  - [x] Lover
  - [ ] Smiler
  - [x] Greeder
  - [x] Killer
  - [x] Slower
  - [x] Watcher
  - [ ] Atoner
- Enemies:
  - [x] Leech
  - [x] Maggot
  - [x] Smile
  - [x] Beaver
  - [x] Lazy Eye
  - [x] Mimic
  - [ ] Octahedron
  - [x] Shade
 
To do:
- [ ] Different texture for the same type of tile
- [ ] Export/Import level as file
- [ ] Multiple levels / Branes
- [ ] Chests / Locusts
- [ ] Dialogue
- [ ] Music
- [ ] Touchscreen/Mobile support

Nice to have:
- [ ] Custom width and height

## Brand Builder

Build your own brand

## How to build a brand

Use the `q` search parameters to enter the sentence you want. 
Only characters from A to Z (lowercase or uppercase) will be included.

For example:
```
https://vs.aleryc.fr/brand-builder/?q=onlyamemoryremains
```


You can also put any non-alphabetical characters between letters to add an empty space

Example!

```
https://vs.aleryc.fr/brand-builder/?q=o.n..l.yam...emo....ryr...ema.i..n.s
```

You can drag and drop the tiles to customize your brand. 
The app will prevent you from reordering the tiles and break your sentence.

Reordering the tiles will automatically update the URL! You only need to copy to share it!

## Run the project

```
npm install
npm start
```

## Build the project

```
npm build
```

You can deploy the `dist/` folder after that.
