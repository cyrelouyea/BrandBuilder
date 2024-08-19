
export enum Direction {
  Up = "Up",
  Down = "Down",
  Left = "Left",
  Right = "Right",
}

export enum PlayerChoice {
  Up = "Up",
  Down = "Down",
  Left = "Left",
  Right = "Right",
  Action = "Action",
}

export interface CommonEvent {
  engine: Engine;
}

export interface EnterEvent extends CommonEvent {
  entity: RegisteredEntity;
  transformed?: boolean;
}

export interface LeaveEvent extends CommonEvent {
  entity: RegisteredEntity;
  transformed?: boolean;
}

export interface StartEvent extends CommonEvent {}

export interface TurnEvent extends CommonEvent {
  playerChoice: PlayerChoice
}

export interface FallEvent extends CommonEvent {}

export interface PushEvent extends CommonEvent {}

export interface DeathEvent extends CommonEvent {
  killer: RegisteredEntity | null
}

export interface KillEvent extends CommonEvent {
  victim: RegisteredEntity
}

export interface CollisionEvent extends CommonEvent {
  entities: RegisteredEntity[],
}

  
export interface Tile {
  name: string;
  isObstacle: boolean;
  onEnter: (self: RegisteredTile, event: EnterEvent) => void;
  onLeave: (self: RegisteredTile, event: LeaveEvent) => void;
}

export interface Entity {
  name: string;
  kind: string;
  facing: Direction;
  turns: number[];
  isPushable: boolean;
  isObstacle: boolean;
  onStart: (self: RegisteredEntity, event: StartEvent) => void;
  onTurn: (self: RegisteredEntity, event: TurnEvent) => void;
  onPush: (self: RegisteredEntity, event: PushEvent) => void;
  onFall: (self: RegisteredEntity, event: FallEvent) => void;
  onCollision: (self: RegisteredEntity, event: CollisionEvent) => void;
  onDeath: (self: RegisteredEntity, event: DeathEvent) => void;
  onKill: (self: RegisteredEntity, event: KillEvent) => void;
}

function getWay(from: number, to: number): number {
  return to - from > 0 ? 1 : -1;
}

function isInSight(engine: Engine, from: number, to: number, way: number, staticPos: number, horizontal: boolean): boolean {
  for (let i = 1; i < Math.abs(from - to); i += 1) {
    let col = horizontal ? from + way * i : staticPos;
    let row = !horizontal ? from + way * i : staticPos;
    let index = engine.getPositionToIndex({ row, col });

    if (
      engine.getTileAt(index).tile.isObstacle || 
      engine.getEntitiesAt(index).length > 0
    ) {
      return false;
    }
  }
  return true;
}


function getSightWay(engine: Engine, indexA: number, indexB: number): Direction | null {
  const { row: rowA, col: colA } = engine.getIndexToPosition(indexA);
  const { row: rowB, col: colB } = engine.getIndexToPosition(indexB);

  if (rowB === rowA) {
    const way = getWay(colB, colA);

    if (isInSight(engine, colB, colA, way, rowB, true)) {
      return way > 0 ? Direction.Left : Direction.Right;
    }
  }

  if (colB === colA) {
    const way = getWay(rowB, rowA);
    if (isInSight(engine, rowB, rowA, way, colB, false)) {
      return way > 0 ? Direction.Up : Direction.Down;
    }
  }

  return null;
}

function getAdjacentTiles(engine: Engine, index: number): RegisteredTile[] {
  const tiles: RegisteredTile[] = [];

  if (index % engine.width !== 0) {
    tiles.push(engine.getTileAt(index - 1));
  }

  if (index % engine.width !== engine.width - 1) {
    tiles.push(engine.getTileAt(index + 1));
  }

  if (index + engine.width < engine.width * engine.height) {
    tiles.push(engine.getTileAt(index + engine.width));
  }

  if (index - engine.width >= 0) {
    tiles.push(engine.getTileAt(index - engine.width));
  }

  return tiles;
}


type BlockedResult = {
  blocked: true;
  blockedBy: RegisteredEntity[];
} | {
  blocked: false;
}


function isBlocked(index: number, direction: Direction, engine: Engine, checkEmpty: boolean = true): BlockedResult {
  let newIndex = index;

  switch (direction) {
  case Direction.Up:
    newIndex -= engine.width;
    if (newIndex < 0) {
      return { blocked: true, blockedBy: [] };
    }
    break;
  case Direction.Down:
    newIndex += engine.width;
    if (newIndex >= engine.maxIndex) {
      return { blocked: true, blockedBy: [] };
    }
    break;
  case Direction.Left:
    newIndex -= 1;
    if (newIndex < 0 || newIndex % engine.width === engine.width - 1) {
      return { blocked: true, blockedBy: [] };
    }
    break;
  case Direction.Right:
    newIndex += 1;
    if (newIndex % engine.width === 0) {
      return { blocked: true, blockedBy: [] };
    }
    break;
  }

  const tile = engine.getTileAt(newIndex);

  if (tile.tile.isObstacle || (checkEmpty && tile.tile.name === "empty")) {
    return { blocked: true, blockedBy: [] };
  }

  const entities = engine.getEntitiesAt(newIndex);

  if (engine.getEntitiesAt(newIndex).length > 0) {
    return { blocked: true, blockedBy: entities };
  }

  return { blocked: false };
}

export class RegisteredTile<T extends Tile = Tile> {
  index: number;
  tile: T;

  constructor(index: number, tile: T) {
    this.index = index;
    this.tile = tile;
  }
}

export class RegisteredEntity<T extends Entity = Entity> {
  id: number;
  entity: T;

  constructor(id: number, entity: T) {
    this.id = id;
    this.entity = entity;
  }
}

export abstract class AbstractTile implements Tile {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  onEnter(self: RegisteredTile, event: EnterEvent) { return; }
  onLeave(self: RegisteredTile, event: LeaveEvent) { return; }

  get isObstacle(): boolean { return false; }
  get name(): string { return this._name; }
}

export class EmptyTile extends AbstractTile {
  constructor() {
    super("empty");
  }

  onEnter(self: RegisteredTile<Tile>, { engine, entity }: EnterEvent): void {
    entity.entity.onFall(entity, { engine });
  }
}

export class NormalTile extends AbstractTile {
  constructor() {
    super("normal");
  }
}

export class WallTile extends AbstractTile {
  constructor() {
    super("wall");
  }

  get isObstacle(): boolean {
    return true;
  }

  onEnter(self: RegisteredTile<Tile>, { engine, entity }: EnterEvent): void {
    engine.kill(entity);
  }
}

export class StairsTile extends AbstractTile { 

  constructor() {
    super("stairs");
  }
}

export class SwitchTile extends AbstractTile { 
  constructor() {
    super("switch");
  }

  onEnter(self: RegisteredTile<Tile>, { engine }: EnterEvent): void {
    this.check(engine);
  }

  onLeave(self: RegisteredTile<Tile>, { engine }: EnterEvent): void {
    this.check(engine);
  }

  check(engine: Engine) {
    let manager = engine.managers
      .find((manager): manager is RegisteredEntity<StairsManager> => 
        manager.entity.name === "stairs-manager"
      );

    if (manager === undefined) {
      return;
    }
    
    manager.entity.check(engine);
  }
}

export class GlassTile extends AbstractTile {
  constructor() {
    super("glass");
  }

  onEnter(self: RegisteredTile, { engine }: EnterEvent) { 
    if (engine.getEntitiesAt(self.index).length === 1) {
      engine.transform(new DamagedGlassTile(), self.index);
    }
  }
}

export class DamagedGlassTile extends AbstractTile {
  constructor() {
    super("damagedglass");
  }

  onLeave(self: RegisteredTile, { engine }: LeaveEvent) {
    if (engine.getEntitiesAt(self.index).length === 0) {
      engine.transform(new EmptyTile(), self.index);
    }
  }
}

export class BombTile extends AbstractTile {
  constructor() {
    super("bomb");
  }

  onEnter(self: RegisteredTile, { engine }: EnterEvent) {
    if (engine.getEntitiesAt(self.index).length === 1) {
      engine.transform(new ExploTile(), self.index);
    }
  }
}

export class ExploTile extends AbstractTile {
  constructor() {
    super("explo");
  }

  onEnter(self: RegisteredTile, { engine, transformed = false }: EnterEvent) {
    if (transformed) {
      return;
    }

    if (engine.getEntitiesAt(self.index).length > 1) {
      return;
    }

    const tilesStack: RegisteredTile[] = [engine.getTileAt(self.index)];
    const discoveredIndices = new Set([self.index]);

    while (tilesStack.length > 0) {
      const tile = tilesStack.pop();


      if (tile === undefined) {
        continue;
      }

      if (tile.tile.name !== "explo") {
        continue;
      }

      engine.transform(new EmptyTile(), tile.index);

      const adjacentTiles = getAdjacentTiles(engine, tile.index);
      
      for (const tile of adjacentTiles) {
        if (!discoveredIndices.has(tile.index)) {
          discoveredIndices.add(tile.index);
          tilesStack.push(tile);
        }
      }
    }
  }
}

// class CopyTile extends AbstractTile {
//   left: RegisteredEntity | null;

//   constructor() {
//     super();
//     this.left = null;
//   }

//   onEnter(self: RegisteredTile, { entities }: EnterEvent) {
//     const entity = entities.find((entity) => entity.entity.kind === "player" || entity.entity.name === "shade");
//     if (entity !== undefined) {
//       this.left = entity;
//     }
//   }

//   onTurn(self: RegisteredTile, { engine }: TurnEvent) {
//     if (this.left && engine.getEntitiesAt(self.index).length === 0) {
//       engine.spawn(new Shade(this.left, WalkDirection.Down), self.index);
//       this.left = null;
//     }
//   }
// }

abstract class AbstractEntity implements Entity {
  private _name: string;
  private _kind: string;

  constructor(name: string, kind: string) {
    this._name = name;
    this._kind = kind;
  }

  abstract get isPushable(): boolean;
  abstract get isObstacle(): boolean;
  abstract get turns(): number[];
  abstract get facing(): Direction;

  get name(): string { return this._name; }
  get kind(): string { return this._kind; }

  onStart(self: RegisteredEntity, event: StartEvent) { }
  onTurn(self: RegisteredEntity, event: TurnEvent) { }
  onFall(self: RegisteredEntity, { engine }: FallEvent) { 
    engine.kill(self);
  }
  onPush(self: RegisteredEntity, event: PushEvent) { }
  onDeath(self: RegisteredEntity, event: DeathEvent) { }
  onKill(self: RegisteredEntity, event: KillEvent) { }
  onCollision(self: RegisteredEntity<Entity>, event: CollisionEvent) { }
}

abstract class VoidObject extends AbstractEntity {
  turns: number[];

  constructor(name: string) {
    super(name, "object");
    this.turns = [];
  }

  get isPushable() { return true; }
  get isObstacle() { return true; }
  get facing() { return Direction.Down; }
}

abstract class VoidEnemy extends AbstractEntity {
  turns: number[];
  
  constructor(name: string) {
    super(name, "enemy");
    this.turns = [2];
  }

  get isPushable() { return false; }
  get isObstacle() { return false; }

  onCollision(self: RegisteredEntity, { engine }: CollisionEvent) {
    engine.kill(self);
  }
}

export class Rock extends VoidObject {
  constructor() { super("rock"); }

}

export class Leech extends VoidEnemy {
  right: boolean;

  constructor(right: boolean) {
    super("leech");
    this.right = right;
  }

  get facing() { 
    return this.right ? Direction.Right : Direction.Left; 
  }

  onTurn(self: RegisteredEntity, { engine }: TurnEvent): void {
    const index = engine.getIndex(self.id);

    if (index === undefined) {
      return;
    }

    const direction = this.right ? Direction.Right : Direction.Left;

    const result = isBlocked(index, direction, engine);
    if (result.blocked) {
      const player = result.blockedBy.find(entity => entity.entity.kind === "player");
      if (player !== undefined) {
        engine.kill(player, self);
      } else {
        this.right = !this.right;
      }
    } else {
      engine.move(self, direction);
    }
  }
}

export class Maggot extends VoidEnemy {
  down: boolean;

  constructor(down: boolean) {
    super("maggot");
    this.down = down;
  }

  get facing() { 
    return this.down ? Direction.Down : Direction.Up; 
  }

  onTurn(self: RegisteredEntity, { engine }: TurnEvent): void {
    const index = engine.getIndex(self.id);

    if (index === undefined) {
      return;
    }

    const direction = this.down ? Direction.Down : Direction.Up;

    const result = isBlocked(index, direction, engine);
    if (result.blocked) {
      const player = result.blockedBy.find(entity => entity.entity.kind === "player");
      if (player !== undefined) {
        engine.kill(player, self);
      } else {
        this.down = !this.down;
      }
    } else {
      engine.move(self, direction);
    }
  }
}

export class Smile extends VoidEnemy {
  constructor() {
    super("smile");
  }

  get facing() { return Direction.Down; }

  onTurn(self: RegisteredEntity, { engine }: TurnEvent): void {
    const index = engine.getIndex(self.id);

    if (index === undefined) {
      return;
    }

    const playerIndex = engine.getIndex(engine.getPlayer().id);

    if (playerIndex === undefined) {
      return;
    }

    const way = getSightWay(engine, index, playerIndex);

    if (way === null) {
      return;
    }

    const result = isBlocked(index, way, engine, false);

    if (result.blocked) {
      const player = result.blockedBy.find(entity => entity.entity.kind === "player");
      if (player !== undefined) {
        engine.kill(player, self);
      }
    } else {
      engine.move(self, way);
    }

  }

}

export class Beaver extends VoidEnemy {
  charging: Direction | null;
  resetting: boolean;

  constructor() {
    super("beaver");
    this.charging = null;
    this.resetting = false;
  }

  get facing() { return this.charging ?? Direction.Down; }

  onTurn(self: RegisteredEntity, { engine }: TurnEvent): void {
    const index = engine.getIndex(self.id);

    if (index === undefined) {
      return;
    }

    if (this.resetting) {
      this.resetting = false;
      return;
    }

    if (this.charging === null) {
      const playerIndex = engine.getIndex(engine.getPlayer().id);
  
      if (playerIndex === undefined) {
        return;
      }
      

      const way = getSightWay(engine, index, playerIndex);


      if (way !== null) {
        this.charging = way;
      }
    }

    if (this.charging === null) {
      return;
    }


    const result = isBlocked(index, this.charging, engine);

    console.log(result);

    if (result.blocked) {
      const player = result.blockedBy.find(entity => entity.entity.kind === "player");
      if (player !== undefined) {
        engine.kill(player, self);
      } else {
        this.charging = null;
        this.resetting = true;
      }
    } else {
      engine.move(self, this.charging);
    }
  }
}

export class LazyEye extends VoidEnemy {
  constructor() {
    super("lazyeye");
  }

  get facing() { return Direction.Down; }
}

function getMimicSuffix(mirrorLeftRight: boolean, mirrorUpDown: boolean): string {
  if (mirrorLeftRight && mirrorUpDown) {
    return "-vh";
  } else if (!mirrorLeftRight && mirrorUpDown) {
    return "-h";
  } else if (mirrorLeftRight && !mirrorUpDown) {
    return "-v";
  } else {
    return "";
  }
}

export class Mimic extends VoidEnemy {
  mirrorLeftRight: boolean;
  mirrorUpDown: boolean;
  facing: Direction; 

  constructor(mirrorLeftRight: boolean, mirrorUpDown: boolean) {
    super("mimic" + getMimicSuffix(mirrorLeftRight, mirrorUpDown));
    this.mirrorLeftRight = mirrorLeftRight;
    this.mirrorUpDown = mirrorUpDown;
    this.facing = Direction.Down;
  }

  onTurn(self: RegisteredEntity, { engine, playerChoice }: TurnEvent) {
    const index = engine.getIndex(self.id);

    if (index === undefined) {
      return;
    }

    let way: Direction | null = null;

    if (
      (!this.mirrorUpDown && playerChoice === PlayerChoice.Up) 
    || (this.mirrorUpDown && playerChoice === PlayerChoice.Down)
    ) {
      way = Direction.Up;
    }

    if (
      (!this.mirrorUpDown && playerChoice === PlayerChoice.Down) 
    || (this.mirrorUpDown && playerChoice === PlayerChoice.Up)
    ) {
      way = Direction.Down;
    }

    if (
      (!this.mirrorLeftRight && playerChoice === PlayerChoice.Left) 
    || (this.mirrorLeftRight && playerChoice === PlayerChoice.Right)
    ) {
      way = Direction.Left;
    }

    if (
      (!this.mirrorLeftRight && playerChoice === PlayerChoice.Right) 
    || (this.mirrorLeftRight && playerChoice === PlayerChoice.Left)
    ) {
      way = Direction.Right;
    }

    if (way === null) {
      return;
    }

    this.facing = way;

    const result = isBlocked(index, way, engine, false);

    if (result.blocked) {
      const player = result.blockedBy.find(entity => entity.entity.kind === "player");
      if (player !== undefined) {
        engine.kill(player, self);
      }

      if (result.blockedBy.some(entity => entity.entity.kind === "object")) {
        engine.move(self, way);
      }
    } else {
      engine.move(self, way);
    }
  }
}


// class Shade extends VoidEnemy {
//   static priority = 1;
//   follow: RegisteredEntity | null;
//   way: WalkDirection;

//   constructor(follow: RegisteredEntity, way: WalkDirection) {
//     super();
//     this.follow = follow;
//     this.way = way;
//   }

//   get priority() { return Shade.priority; }

//   onTurn(self: RegisteredEntity<Entity>, event: TurnEvent): void {
    
//   }
// }

export class VoidPlayer extends AbstractEntity {
  turns: number[];
  facing: Direction;
  stock: RegisteredTile[];
  numberOfVoids: number;
  numberOfSteps: number;
  voidRodUsed: boolean;
  

  constructor() {
    super("player", "player");

    this.facing = Direction.Down;
    this.turns = [0];
    this.stock = [];
    this.numberOfSteps = 0;
    this.numberOfVoids = 0;
    this.voidRodUsed = true;
  }

  get isPushable() { return false; }
  get isObstacle() { return true; }

  onTurn(self: RegisteredEntity, { engine, playerChoice }: TurnEvent) {
    this.voidRodUsed = false;

    const index = engine.getIndex(self.id);

    if (index === undefined) {
      return;
    }

    if (playerChoice === PlayerChoice.Action) {
      let { row, col } = engine.getIndexToPosition(index);

      switch (this.facing) {
      case Direction.Up: row -= 1; break;
      case Direction.Down: row += 1; break;
      case Direction.Left: col -= 1; break;
      case Direction.Right: col += 1; break;
      }

      if (row < 0 || row >= engine.height || col < 0 || col >= engine.width) {
        // can't stock out of screen tiles
        engine.cancelTurn = true;
        return ;
      }

      const targetIndex = engine.getPositionToIndex({ row, col });

      if (engine.getEntitiesAt(targetIndex).length > 0) {
        // can't stock tile with entities on it
        engine.cancelTurn = true;
        return;
      }

      const tile = engine.getTileAt(targetIndex);

      if (tile.tile.name === "empty" && this.stock.length > 0) {
        // place tile in stock in this empty space
        engine.transform(this.stock.pop()!.tile, targetIndex);
        this.numberOfVoids += 1;
        this.voidRodUsed = true;
        return;
      }

      if (tile.tile.name !== "empty" && !tile.tile.isObstacle && this.stock.length === 0) {
        // take the tile if you don't stock any
        const { oldTile } = engine.transform(new EmptyTile(), targetIndex);
        this.numberOfVoids += 1;
        this.voidRodUsed = true;
        this.stock.push(oldTile);
        return;
      }

      engine.cancelTurn = true;
      return;
    }

    let direction: Direction;
    switch (playerChoice) {
    case PlayerChoice.Up:  direction = Direction.Up; break;
    case PlayerChoice.Down: direction = Direction.Down; break;
    case PlayerChoice.Left: direction = Direction.Left; break;
    case PlayerChoice.Right: direction = Direction.Right; break;
    }

    this.facing = direction;

    const result = isBlocked(index, direction, engine, false);

    if (result.blocked) {
      const enemy = result.blockedBy.find(entity => entity.entity.kind === "enemy");

      if (enemy !== undefined) {
        engine.kill(self, enemy);
        return;
      }
    } 

    engine.move(self, direction);
    this.numberOfSteps += 1;
  }

  onDeath(self: RegisteredEntity, { engine }: DeathEvent): void {
    engine.end();
  }
}

export class Voider extends VoidObject {
  constructor() { super("voider"); }
}

export class Lover extends VoidObject {
  constructor() { super("lover"); }

  onFall(self: RegisteredEntity, { engine }: FallEvent) {
    const index = engine.getIndex(self.id);
    if (index !== undefined) {
      super.onFall(self, { engine });
      engine.transform(new NormalTile(), index);
    }
  }
}

export class Smiler extends VoidObject { 
  constructor() { super("smiler"); }
}

export class Greeder extends VoidObject {
  constructor() {
    super("greeder");
    this.turns = [1, 3];
  }

  onTurn(self: RegisteredEntity, { engine }: TurnEvent): void {
    const index = engine.getIndex(self.id);

    if (index === undefined) {
      return;
    }

    const player = engine.getPlayer();
    const playerIndex = engine.getIndex(player.id);

    if (playerIndex === undefined) {
      return;
    }

    const way = getSightWay(engine, index, playerIndex);

    if (way !== null) {
      engine.kill(player, self);
    }
  }
}

export class Killer extends VoidObject { 
  constructor() { super("killer"); }
}

export class KillerManager extends VoidObject {
  activated: boolean;

  constructor() { 
    super("killer-manager"); 
    this.turns = [1, 3];
    this.activated = false;
  }

  onStart(self: RegisteredEntity<Entity>, { engine }: StartEvent) {
    this.check(engine);
  }

  onTurn(self: RegisteredEntity<Entity>, { engine }: TurnEvent): void {
    this.check(engine);
  }

  private check(engine: Engine) {
    if (this.activated) {
      return;
    }

    const hasEnemy = engine.entities.some(entities => 
      entities.some(entity => entity.entity.kind === "enemy")
    );

    if (hasEnemy) {
      return;
    }

    for (const entity of engine.entities.flat()) {
      if (entity.entity.name === "killer") {
        engine.kill(entity);
      }
    }

    this.activated = true;
  }
}

export class Slower extends VoidObject {
  private _isPushable: boolean;

  constructor() {
    super("slower");
    this._isPushable = true;
  }

  onPush(): void {
    this._isPushable = false;
  }

  get isPushable() {
    return this._isPushable;
  }
}

export class Watcher extends VoidObject { 
  constructor() { super("watcher"); }
}

export class WatcherManager extends VoidObject {
  numberOfVoids: number;

  constructor() { 
    super("watcher-manager");
    this.turns = [0.5];
    this.numberOfVoids = 0;
  }

  onTurn(self: RegisteredEntity<Entity>, { engine }: TurnEvent): void {
    let numberOfWatchers = 0;

    for (const entities of engine.entities) {
      for (const entity of entities) {
        if (entity.entity.name === "watcher") {
          numberOfWatchers += 1;
        }
      }
    }

    if (numberOfWatchers === 0) {
      this.numberOfVoids = 0;
      return;
    }

    const player = engine.getPlayer();

    if (player.entity.voidRodUsed) {
      this.numberOfVoids += 1;
    }

    if (this.numberOfVoids >= numberOfWatchers) {
      engine.kill(player, self);
    }
  }
}

export class Atoner extends VoidObject { 
  constructor() { super("atoner"); }
}


export class StairsManager extends VoidObject {
  private _closed: boolean;

  constructor() { 
    super("stairs-manager"); 
    this._closed = true;
    this.turns = [1];
  }

  get closed() { return this._closed; }

  onStart(self: RegisteredEntity<Entity>, { engine }: StartEvent): void {
    this.check(engine);
  }

  onTurn(self: RegisteredEntity<Entity>, { engine }: TurnEvent): void {
    this.check(engine);
  }

  check(engine: Engine) {
    const player = engine.getPlayer();

    if (player.entity.stock.some(tile => tile.tile.name === "switch")) {
      this._closed = true;
      return;
    }

    this._closed = !engine.tiles
      .filter(tile => tile.tile.name === "switch")
      .every(tile => engine.getEntitiesAt(tile.index).length > 0);

    if (this._closed) {
      return;
    }

    const playerIndex = engine.getIndex(player.id);

    if (playerIndex === undefined) {
      return;
    }

    if (engine.tiles[playerIndex].tile.name === "stairs") {
      engine.end();
    }
  }
}


export interface SetTileResult {
  newTile: RegisteredTile;
  oldTile: RegisteredTile;
}

export class EngineElements {
  private _engine: Engine;
  private _tiles: RegisteredTile[];
  private _managers: RegisteredEntity[];
  private _entities: RegisteredEntity[][];
  private _entityIdToIndex: Map<number, number>;
  private _player: RegisteredEntity<VoidPlayer>;

  constructor({ engine, tiles, entities, managers }: { engine: Engine, tiles: RegisteredTile[], entities: RegisteredEntity[][], managers: RegisteredEntity[] }) {
    this._engine = engine;
    this._tiles = tiles;
    this._entities = entities;
    this._managers = managers;
    this._entityIdToIndex = new Map(entities.flatMap(
      (entities, index) => entities.map(entity => [entity.id, index])
    ));

    const players = entities.flat().filter(
      (entity): entity is RegisteredEntity<VoidPlayer> => 
        entity.entity.kind === "player"
    );
    
    if (players.length != 1) {
      throw new Error("there must be one player entity");
    }

    this._player = players[0];
  }

  get tiles() { return this._tiles; }
  get entities() { return this._entities; }
  get managers() { return this._managers; }
  get player() { return this._player; }

  addEntity<T extends Entity>(entity: T, index: number): RegisteredEntity<T> {
    const registeredEntity = new RegisteredEntity(this._engine.generateId(), entity);
    this._entities[index].push(registeredEntity);
    this._entityIdToIndex.set(registeredEntity.id, index);
    const newTile = this._engine.getTileAt(index);
    newTile.tile.onEnter(newTile, { engine: this._engine, entity: registeredEntity });
    return registeredEntity;
  }

  moveEntity(entity: RegisteredEntity, newIndex: number) {
    const oldIndex = this._entityIdToIndex.get(entity.id)!;
    const oldTile = this._tiles[oldIndex];
    const newTile = this._tiles[newIndex];
    this._entityIdToIndex.set(entity.id, newIndex);
    this._entities[oldIndex] = this._entities[oldIndex].filter(e => e.id !== entity.id);
    this._entities[newIndex].push(entity);

    oldTile.tile.onLeave(oldTile, { engine: this._engine, entity });
    newTile.tile.onEnter(newTile, { engine: this._engine, entity });

  }

  killEntity(victim: RegisteredEntity, killer: RegisteredEntity | null = null) {
    const index = this._entityIdToIndex.get(victim.id)!;
    const tile = this._tiles[index];
    this._entityIdToIndex.delete(victim.id);
    this._entities[index] = this._entities[index].filter(e => e.id !== victim.id);

    tile.tile.onLeave(tile, { engine: this._engine, entity: victim });

    victim.entity.onDeath(victim, { killer, engine: this._engine });

    if (killer !== null) {
      killer.entity.onKill(killer, { victim, engine: this._engine });
    }
  }

  setTile<T extends Tile>(tile: T, index: number): SetTileResult {
    const newTile = new RegisteredTile(index, tile);
    const oldTile = this._tiles[index];
    this._tiles[index] = newTile;

    for (const entity of this._entities[index]) {
      newTile.tile.onEnter(newTile, { engine: this._engine, entity, transformed: true });
      oldTile.tile.onLeave(oldTile, { engine: this._engine, entity, transformed: true });
    }

    return { newTile, oldTile };
  }

  getIndex(id: number): number | undefined {
    return this._entityIdToIndex.get(id);
  }
}


export interface MoveResult { status: string }
export interface TeleportResult { status: string }

export interface Move {
  entity: RegisteredEntity;
  direction: Direction;
  callback?: MoveResult;
}

export interface Transform {
  tile: Tile;
  index: number;
}

export interface Teleport {
  entity: RegisteredEntity;
  index: number;
  callback?: TeleportResult;
}


export class Engine {

  private _elements: EngineElements;
  private _moves: { entity: RegisteredEntity, index: number }[];
  private _forces: { entity: RegisteredEntity, direction: Direction}[];

  private _lastId: number;
  private _width: number;
  private _height: number;
  private _stop: boolean;
  private _started: boolean;

  private _numberOfTurns: number;
  private _numberOfSteps: number;
  private _numberOfVoids: number;

  public cancelTurn: boolean;

  constructor(attrs: { tiles: Tile[], entities: (Entity | null)[], managers: Entity[], width: number }) {
    if (attrs.width <= 0) {
      throw new Error("width must be positive");
    }
    
    if (attrs.tiles.length != attrs.entities.length) {
      throw new Error("tiles and entities must have the same length");
    }
    
    if (attrs.tiles.length % attrs.width != 0) {
      throw new Error("grid is not a rectangle");
    }

    this._width = attrs.width;
    this._height = attrs.tiles.length / attrs.width;
    this._lastId = -1;
    
    const tiles = attrs.tiles.map((tile, index) => new RegisteredTile(index, tile));
    const entities = attrs.entities.map((entity) => 
      entity !== null ?  
        [new RegisteredEntity(this.generateId(), entity)] : 
        []
    );
    const managers = attrs.managers.map((manager) => new RegisteredEntity(this.generateId(), manager));
    
    this._elements = new EngineElements({ engine: this, entities, tiles, managers });
    this._forces = [];
    this._moves = [];
    this._stop = false;
    this._started = false;
    this._numberOfTurns = 0;
    this._numberOfSteps = 0;
    this._numberOfVoids = 0;
    this.cancelTurn = false;
  }

  get width(): number { return this._width; }
  get height(): number { return this._height; }
  get maxIndex(): number { return this._width * this._height; }
  get tiles() { return this._elements.tiles; }
  get entities() { return this._elements.entities; }
  get managers() { return this._elements.managers; }
  
  get numberOfTurns() { return this._numberOfTurns; }
  get numberOfSteps() { return this._elements.player.entity.numberOfSteps; }
  get numberOfVoids() { return this._elements.player.entity.numberOfVoids; }

  generateId() { return ++this._lastId; }

  start() {
    for (const tile of this._elements.tiles) {
      for (const entity of this._elements.entities[tile.index]) {
        tile.tile.onEnter(tile, { engine: this, entity });
      }
    }

    for (const entities of this._elements.entities) {
      if (entities.length >= 2) {
        entities.forEach(entity => entity.entity.onCollision(entity, { engine: this, entities }));
      }
    }

    for (const entities of this._elements.entities) {
      for (const entity of entities) {
        entity.entity.onStart(entity, { engine: this });
      }
    }


    for (const manager of this._elements.managers) {
      manager.entity.onStart(manager, { engine: this });
    }

    this._started = true;
  }

  play(choice: PlayerChoice) {
    if (!this._started) {
      throw new Error("`start` not called");
    }

    console.debug("Start of turn");
    console.debug("Player choice: %s", choice);

    const sortedEntities = this._elements.entities
      .flat()
      .map(entity => entity.entity.turns.map(turn => ({ turn, entity })))
      .concat(this._elements.managers.map(
        manager => manager.entity.turns.map(
          turn => ({ turn, entity: manager })
        )
      ))
      .flat()
      .sort(({ turn: a }, { turn: b }) => a - b);

    this.cancelTurn = false;

    while (!this._stop && !this.cancelTurn) {
      let entityAndTurn = sortedEntities.shift();

      if (entityAndTurn === undefined) {
        break;
      }

      const { turn: currentTurn, entity } = entityAndTurn;
      
      console.debug("Start of turn %s", currentTurn);
      
      this._forces = [];
      this._moves = [];

      entity.entity.onTurn(entity, { engine: this, playerChoice: choice });
      while (sortedEntities.length > 0 && sortedEntities[0].turn === currentTurn) {
        const { entity } = sortedEntities.shift()!;
        entity.entity.onTurn(entity, { engine: this, playerChoice: choice });
      }

      this._resolveTurn();

      console.debug("End of turn %s %s", currentTurn, this._stop);
    }
    
    if (!this.cancelTurn) {
      this._numberOfTurns += 1;
    }

    console.debug("End of turn");

    return this._stop;
  }

  private _resolveTurn() {
  
    for (const { entity, index } of this._moves) {
      this._elements.moveEntity(entity, index);
    }

    for (const entities of this._elements.entities) {
      if (entities.length >= 2) {
        entities.forEach(entity => entity.entity.onCollision(entity, { engine: this, entities }));
      }
    }

    const entityToForces = new Map<number, { entity: RegisteredEntity, directions: Direction[] }>();
    for (const { entity, direction } of this._forces) {
      const element = entityToForces.get(entity.id);
      if (element === undefined) {
        entityToForces.set(entity.id, { entity, directions: [direction] });
      } else {
        element.directions.push(direction);
      }
    }

    for (const [entityId, { entity, directions }] of entityToForces) {
      if (!entity.entity.isPushable) {
        continue;
      }

      const index = this.getIndex(entityId);

      if (index === undefined) {
        continue;
      }

      let { row, col } = this.getIndexToPosition(index);

      for (const direction of directions) {
        switch (direction) {
        case Direction.Up: row -= 1; break;
        case Direction.Down: row += 1; break;
        case Direction.Left: col -= 1; break;
        case Direction.Right: col += 1; break;
        }
      }

      if (row < 0 || row >= this._height || col < 0 || col >= this._width) {
        // blocked by side
        continue;
      }

      const newIndex = this.getPositionToIndex({ row, col });

      const entities = this.getEntitiesAt(newIndex);

      if (entities.some(entity => entity.entity.isObstacle)) {
        // blocked by obstacle entity
        continue;
      }

      const tile = this.getTileAt(newIndex);

      if (tile.tile.isObstacle) {
        return;
      }

      this._elements.moveEntity(entity, newIndex);
      entity.entity.onPush(entity, { engine: this });
    }

    for (const entities of this._elements.entities) {
      if (entities.length >= 2) {
        entities.forEach(entity => entity.entity.onCollision(entity, { engine: this, entities }));
      }
    }
  }

  move(entity: RegisteredEntity, direction: Direction) {
    const index = this.getIndex(entity.id);

    if (index === undefined) {
      return;
    }

    let newIndex: number = index;

    switch (direction) {
    case Direction.Up:
      newIndex -= this._width;
      if (newIndex < 0) {
        return;
      }
      break;
    case Direction.Down:
      newIndex += this._width;
      if (newIndex >= this.maxIndex) {
        return;
      }
      break;
    case Direction.Left:
      newIndex -= 1;
      if (newIndex < 0 || newIndex % this._width == this._width - 1) {
        return;
      }
      break;
    case Direction.Right:
      newIndex += 1;
      if (newIndex % this._width == 0) {
        return;
      }
      break;
    }

    const tile = this.getTileAt(newIndex);

    if (tile.tile.isObstacle) {
      return;
    }

    const entities = this.getEntitiesAt(newIndex);

    if (entities.length > 0) {
      this._forces.push(...entities.map(entity => ({ entity, direction })));
    } else {
      this._moves.push({ entity, index: newIndex });
    }
  }

  transform(tile: Tile, index: number) {
    return this._elements.setTile(tile, index);
  }

  spawn(entity: Entity, index: number): RegisteredEntity {
    return this._elements.addEntity(entity, index);
  }

  kill(victim: RegisteredEntity, killer: RegisteredEntity | null = null) {
    this._elements.killEntity(victim, killer);
  }

  end() {
    this._stop = true;
  }

  getPlayer() {
    return this._elements.player;
  }

  getTileAt(index: number) {
    return this._elements.tiles[index];
  }

  getEntitiesAt(index: number) {
    return this._elements.entities[index];
  }

  getIndex(id: number) {
    return this._elements.getIndex(id);
  }

  getIndexToPosition(index: number) {
    return {
      row: Math.trunc(index / this._width),
      col: index % this._width,
    };
  }

  getPositionToIndex({ row, col }: { row: number, col: number }) {
    return row * this._width + col;
  }
}

