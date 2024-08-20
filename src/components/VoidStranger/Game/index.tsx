import {
  Component,
  onMount,
  onCleanup,
  createSignal,
  For,
  JSX,
  createMemo,
  createEffect,
  Switch,
  Match,
  Setter,
  Index,
} from "solid-js";
import {
  Beaver,
  BombTile,
  Direction,
  EmptyTile,
  Engine,
  Entity,
  ExploTile,
  GlassTile,
  Greeder,
  Killer,
  KillerManager,
  LazyEye,
  Leech,
  Lover,
  Maggot,
  Mimic,
  NormalTile,
  PlayerChoice,
  RegisteredEntity,
  Rock,
  Slower,
  Smile,
  StairsTile,
  StairsManager,
  SwitchTile,
  Tile,
  VoidPlayer,
  WallTile,
  WatcherManager,
  Watcher,
  CopyManager,
  CopyTile,
  VoidRodTile,
  VoidSwordTile,
  WhiteTile,
  VoidWingsTile,
} from "./engine";

import floorRemovedImg from "../../../assets/tiles/floor-removed.png";
import exitImg from "../../../assets/tiles/exit.png";
import exitClosedImg from "../../../assets/tiles/exit-closed.png";
import floorImg from "../../../assets/tiles/floor.png";
import glassImg from "../../../assets/tiles/glass.png";
import damagedGlassImg from "../../../assets/tiles/damagedglass.png";
import bombImg from "../../../assets/tiles/bomb.png";
import exploImg from "../../../assets/tiles/explo.png";
import switchImg from "../../../assets/tiles/switch.png";
import copyImg from "../../../assets/tiles/copy.png";
import whiteImg from "../../../assets/tiles/white.png";
import voidRodImg from "../../../assets/tiles/void-rod.png";
import voidSwordImg from "../../../assets/tiles/void-sword.png";
import voidWingsImg from "../../../assets/tiles/void-wings.png";
import voidWingsUsedImg from "../../../assets/tiles/void-wings-used.png";

import boulderImg from "../../../assets/tiles/boulder.png";
import leechLeftImg from "../../../assets/tiles/leech-left.png";
import leechRightImg from "../../../assets/tiles/leech-right.png";
import playerDownImg from "../../../assets/tiles/player-down.png";
import playerUpImg from "../../../assets/tiles/player-up.png";
import playerRightImg from "../../../assets/tiles/player-right.png";
import playerLeftImg from "../../../assets/tiles/player-left.png";
import lazyEyeImg from "../../../assets/tiles/lazyeye.png";
import smileLeftImg from "../../../assets/tiles/smile-left.png";
import smileRightImg from "../../../assets/tiles/smile-right.png";
import maggotUpImg from "../../../assets/tiles/maggot-up.png";
import maggotDownImg from "../../../assets/tiles/maggot-down.png";
import beaverUpImg from "../../../assets/tiles/beaver-up.png";
import beaverDownImg from "../../../assets/tiles/beaver-down.png";
import beaverLeftImg from "../../../assets/tiles/beaver-left.png";
import beaverRightImg from "../../../assets/tiles/beaver-right.png";
import mimicBlackDownImg from "../../../assets/tiles/mimic-black-down.png";
import mimicBlackUpImg from "../../../assets/tiles/mimic-black-up.png";
import mimicBlackLeftImg from "../../../assets/tiles/mimic-black-left.png";
import mimicBlackRightImg from "../../../assets/tiles/mimic-black-right.png";
import mimicWhiteDownImg from "../../../assets/tiles/mimic-white-down.png";
import mimicWhiteUpImg from "../../../assets/tiles/mimic-white-up.png";
import mimicWhiteLeftImg from "../../../assets/tiles/mimic-white-left.png";
import mimicWhiteRightImg from "../../../assets/tiles/mimic-white-right.png";
import mimicGreyDownImg from "../../../assets/tiles/mimic-grey-down.png";
import mimicGreyUpImg from "../../../assets/tiles/mimic-grey-up.png";
import mimicGreyLeftImg from "../../../assets/tiles/mimic-grey-left.png";
import mimicGreyRightImg from "../../../assets/tiles/mimic-grey-right.png";
import shadeDownImg from "../../../assets/tiles/shade-down.png";
import shadeUpImg from "../../../assets/tiles/shade-up.png";
import shadeRightImg from "../../../assets/tiles/shade-right.png";
import shadeLeftImg from "../../../assets/tiles/shade-left.png";

import loverImg from "../../../assets/tiles/lover.png";
import slowerImg from "../../../assets/tiles/slower.png";
import slowerStopImg from "../../../assets/tiles/slower-stop.png";
import greederImg from "../../../assets/tiles/greeder.png";
import killerImg from "../../../assets/tiles/killer.png";
import watcherImg from "../../../assets/tiles/watcher.png";
import watcherEyesImg from "../../../assets/tiles/watcher-eyes.png";


import "./index.css";

const WIDTH = 14;


const TILES_MAPPING = new Map<string, { invoke: () => Tile, keywords: string, name: string }>([
  ["W", { invoke: () => new WallTile(), keywords: "wall obstacle blocking", name: "Wall" }],
  [".", { invoke: () => new NormalTile(), keywords: "normal", name: "Normal"  }],
  ["E", { invoke: () => new StairsTile(), keywords: "stairs exit", name: "Stairs" }],
  [" ", { invoke: () => new EmptyTile(), keywords: "hole space empty", name: "Hole" }],
  ["G", { invoke: () => new GlassTile(), keywords: "glass ice", name: "Glass" }],
  ["B", { invoke: () => new BombTile(), keywords: "bomb explo", name: "Bomb" }],
  ["Be", { invoke: () => new ExploTile(), keywords: "bomb explo", name: "Explo" }],
  ["S", { invoke: () => new SwitchTile(), keywords: "switch button", name: "Switch" }],
  ["C", { invoke: () => new CopyTile(), keywords: "copy shade", name: "Copy" }],
  ["Wh", { invoke: () => new WhiteTile(), keywords: "blank white", name: "White"}],
  ["Vr", { invoke: () => new VoidRodTile(), keywords: "void rod", name: "Rod"}],
  ["Vs", { invoke: () => new VoidSwordTile(), keywords: "void sword", name: "Sword"}],
  ["Vw", { invoke: () => new VoidWingsTile(), keywords: "void wings", name: "Wings"}],
]);

const ENTITIES_MAPPING = new Map<string, { invoke: () => Entity | null, keywords: string, name: string }>([
  [".", { invoke: () => null, keywords: "remove nothing", name: "None" }],
  ["R", { invoke: () => new Rock(), keywords: "rock boulder egg tail", name: "Boulder" }],
  ["P", { invoke: () => new VoidPlayer(), keywords: "player grey", name: "Player" }],
  ["Ll", { invoke: () => new Leech(false), keywords: "leech eus snake enemy left", name: "Leech (L)" }],
  ["Lr", { invoke: () => new Leech(true), keywords: "leech eus snake enemy right", name: "Leech (R)" }],
  ["E", { invoke: () => new LazyEye(), keywords: "lazy eye gor enemy", name: "Lazy Eye" }],
  ["S", { invoke: () => new Smile(), keywords: "smile bee", name: "Smile" }],
  ["Mu", { invoke: () => new Maggot(false), keywords: "maggot mon enemy left", name: "Maggot (U)" }],
  ["Md", { invoke: () => new Maggot(true), keywords: "maggot mon enemy right", name: "Leech (D)" }],
  ["B", { invoke: () => new Beaver(), keywords: "beaver tan enemy", name: "Beaver" }],
  ["M", { invoke: () => new Mimic(false, false), keywords: "mimic cif enemy", name: "Mimic" }],
  ["Mv", { invoke: () => new Mimic(true, false), keywords: "mimic cif enemy vertical", name: "Mimic (V)" }],
  ["Mh", { invoke: () => new Mimic(false, true), keywords: "mimic cif enemy horizontal", name: "Mimic (H)" }],
  ["Mvh", { invoke: () => new Mimic(true, true), keywords: "mimic cif enemy vertical horizontal", name: "Mimic (V/H)" }],
  ["Lo", { invoke: () => new Lover(), keywords: "lover eus statue", name: "Lover" }],
  ["Sl", { invoke: () => new Slower(), keywords: "slower gor statue", name: "Slower" }],
  ["Gr", { invoke: () => new Greeder(), keywords: "greeder mon statue", name: "Greeder" }],
  ["Ki", { invoke: () => new Killer(), keywords: "killer tan statue", name: "Killer" }],
  ["Wa", { invoke: () => new Watcher(), keywords: "watcher lev statue", name: "Watcher" }],
]);


function zip<T1, T2>(first: T1[], second: T2[]): [T1, T2][] {
  return first.map((k, i) => [k, second[i]]);
}

function* chunk<T>(array: T[], size: number): IterableIterator<T[]> {
  for (let i = 0; i < array.length; i += size) {
    yield array.slice(i, i + size);
  }
}

function getBackgroundTile(tile: Tile, context?: { row: number, col: number, tiles: Tile[], wingsCount: number, engine?: Engine }): JSX.CSSProperties {
  switch (tile.name) {
  case "wall":
    return { "background-color": "#333" };
  case "normal":
    return {
      "background-color": "white",
      "background-image": "url(" + floorImg + ")",
      
    };
  case "stairs": {
    if (!context) {
      return {
        "background-image": "url(" + exitImg + ")",
      };
    }
    
    const manager = context.engine?.managers.find((manager): manager is RegisteredEntity<StairsManager> => 
      manager.entity.name === "stairs-manager"
    );

    if (!manager || !manager.entity.closed) {
      return {
        "background-image": "url(" + exitImg + ")",
      };
    } else {
      return {
        "background-image": "url(" + exitClosedImg + ")",
      };
    }
  }
  case "glass":
    return {
      "background-image": "url(" + glassImg + ")",
      
    };
  case "damagedglass":
    return {
      "background-image": "url(" + damagedGlassImg + ")",
      
    };
  case "bomb":
    return {
      "background-image": "url(" + bombImg + ")",
    };
  case "explo":
    return {
      "background-image": "url(" + exploImg + ")",
      
    };
  case "empty": {
    if (context === undefined) {
      return { "background-color": "transparent" };
    }

    const { row, col, tiles } = context;

    if (row === 0) {
      return { "background-color": "transparent" };
    }

    if (tiles[(row - 1) * WIDTH + col].name === "empty") {
      return { "background-color": "transparent" };
    } else {
      return {
        "background-image": "url(" + floorRemovedImg + ")",
      };
    }
  }
  case "switch": 
    return {
      "background-image": "url(" + switchImg + ")",
    };
  case "copy": 
    return {
      "background-image": "url(" + copyImg + ")",
    };
  case "white":
    return {
      "background-image": "url(" + whiteImg + ")",
    };
  case "rod":
    return {
      "background-image": "url(" + voidRodImg + ")" + ", " + "url(" + whiteImg + ")",
    };
  case "sword":
    return {
      "background-image": "url(" + voidSwordImg + ")" + ", " + "url(" + whiteImg + ")",
    };
  case "wings":{
    if (context === undefined) {
      return {
        "background-image": "url(" + voidWingsImg + ")" + ", " + "url(" + whiteImg + ")",
      };
    }

    const wingsUsed = context.engine?.player.entity.wingsUsed;

    if (wingsUsed !== undefined && wingsUsed > context.wingsCount) {
      return {
        "background-image": "url(" + voidWingsUsedImg + ")" + ", " + "url(" + whiteImg + ")",
      };
    }

    return {
      "background-image": "url(" + voidWingsImg + ")" + ", " + "url(" + whiteImg + ")",
    };
  }
  default:
    return {};
  }
}

function getBackgroundEntity(entities: Entity[], context?: { watcherCount: number, engine: Engine }): JSX.CSSProperties {
  if (entities.length === 0) {
    return {};
  }

  const entity = entities[0];

  switch (entity.name) {
  case "rock":
    return {
      "background-image": "url(" + boulderImg + ")",
    };

  case "lazyeye":
    return {
      "background-image": "url(" + lazyEyeImg + ")",
    };
  case "leech":
    if (entity.facing === Direction.Left) {
      return {
        "background-image": "url(" + leechLeftImg + ")",
      };
    } else {
      return {
        "background-image": "url(" + leechRightImg + ")",
      };
    }
  case "player":
    if (entity.facing === Direction.Down) {
      return {
        "background-image": "url(" + playerDownImg + ")",
      };
    } else if (entity.facing === Direction.Up) {
      return {
        "background-image": "url(" + playerUpImg + ")",
        
      };
    } else if (entity.facing === Direction.Left) {
      return {
        "background-image": "url(" + playerLeftImg + ")",
      };
    } else {
      return {
        "background-image": "url(" + playerRightImg + ")",
      };
    }
  case "smile":
    if (entity.facing === Direction.Left) {
      return {
        "background-image": "url(" + smileLeftImg + ")",
      };
    } else if (entity.facing === Direction.Right) {
      return {
        "background-image": "url(" + smileRightImg + ")",
      };
    } else {
      return {
        "background-image": "url(" + smileLeftImg + ")",
      };
    }
  case "maggot":
    if (entity.facing === Direction.Up) {
      return {
        "background-image": "url(" + maggotUpImg + ")",
      };
    } else {
      return {
        "background-image": "url(" + maggotDownImg + ")",
      };
    }

  case "beaver":
    if (entity.facing === Direction.Down) {
      return {
        "background-image": "url(" + beaverDownImg + ")",
      };
    } else if (entity.facing === Direction.Up) {
      return {
        "background-image": "url(" + beaverUpImg + ")",
      };
    } else if (entity.facing === Direction.Left) {
      return {
        "background-image": "url(" + beaverLeftImg + ")",
      };
    } else {
      return {
        "background-image": "url(" + beaverRightImg + ")",
      };
    }
  case "mimic": // doesn't exist in the original game
  case "mimic-v":
    if (entity.facing === Direction.Down) {
      return {
        "background-image": "url(" + mimicWhiteDownImg + ")",
      };
    } else if (entity.facing === Direction.Up) {
      return {
        "background-image": "url(" + mimicWhiteUpImg + ")",
      };
    } else if (entity.facing === Direction.Left) {
      return {
        "background-image": "url(" + mimicWhiteLeftImg + ")",
      };
    } else {
      return {
        "background-image": "url(" + mimicWhiteRightImg + ")",
      };
    }
  case "mimic-h":
    if (entity.facing === Direction.Down) {
      return {
        "background-image": "url(" + mimicGreyDownImg + ")",
      };
    } else if (entity.facing === Direction.Up) {
      return {
        "background-image": "url(" + mimicGreyUpImg + ")",
      };
    } else if (entity.facing === Direction.Left) {
      return {
        "background-image": "url(" + mimicGreyLeftImg + ")",
      };
    } else {
      return {
        "background-image": "url(" + mimicGreyRightImg + ")",
      };
    }
  case "mimic-vh":
    if (entity.facing === Direction.Down) {
      return {
        "background-image": "url(" + mimicBlackDownImg + ")",
      };
    } else if (entity.facing === Direction.Up) {
      return {
        "background-image": "url(" + mimicBlackUpImg + ")",
      };
    } else if (entity.facing === Direction.Left) {
      return {
        "background-image": "url(" + mimicBlackLeftImg + ")",
      };
    } else {
      return {
        "background-image": "url(" + mimicBlackRightImg + ")",
      };
    }
  case "shade":
    if (entity.facing === Direction.Down) {
      return {
        "background-image": "url(" + shadeDownImg + ")",
      };
    } else if (entity.facing === Direction.Up) {
      return {
        "background-image": "url(" + shadeUpImg + ")",
      };
    } else if (entity.facing === Direction.Left) {
      return {
        "background-image": "url(" + shadeLeftImg + ")",
      };
    } else {
      return {
        "background-image": "url(" + shadeRightImg + ")",
      };
    }
  case "lover":
    return {
      "background-image": "url(" + loverImg + ")",
    };
  case "slower":
    if (entity.isPushable) {
      return {
        "background-image": "url(" + slowerImg + ")",
      };
    } else {
      return {
        "background-image": "url(" + slowerStopImg + ")",
      };
    }
  case "greeder":
    return {
      "background-image": "url(" + greederImg + ")",
    };
  case "killer":
    return {
      "background-image": "url(" + killerImg + ")",
    };
  case "watcher": {
    if (!context) {
      return {
        "background-image": "url(" + watcherImg + ")",
      };
    }

    const manager = context.engine.managers.find((manager): manager is RegisteredEntity<WatcherManager> => 
      manager.entity.name === "watcher-manager"
    );

    if (!manager) {
      return {
        "background-image": "url(" + watcherImg + ")",
      };
    }

    if (manager.entity.numberOfVoids <= context.watcherCount) {
      return {
        "background-image": "url(" + watcherImg + ")",
      };
    }

    return {
      "background-image": "url(" + watcherEyesImg + ")",
    };
  }
  }

  return {};
}

function createEngine(entities: string[], tiles: string[]) {
  return new Engine({
    width: WIDTH,
    entities: entities
      .map((chr) => ENTITIES_MAPPING.get(chr)!.invoke()),
    tiles: tiles
      .map((chr) => TILES_MAPPING.get(chr)!.invoke()),
    managers: [new KillerManager(), new StairsManager(), new WatcherManager(), new CopyManager()],
  });
}

export const VoidStrangerGame: Component = () => {
  
  const [tiles, setTiles] = createSignal<string[]>((
    ".,.,.,.,.,.,.,.,.,.,.,.,.,.," +
    ".,.,.,.,.,.,.,.,.,.,.,.,.,.," +
    ".,.,.,.,.,.,.,.,.,.,.,.,.,.," +
    ".,.,.,.,.,.,.,.,.,.,.,.,.,.," +
    ".,.,.,.,.,.,.,.,.,.,.,.,.,.," +
    ".,.,.,.,.,.,.,.,.,.,.,.,.,.," +
    ".,.,.,.,.,.,.,.,.,.,.,.,.,.," +
    ".,.,.,.,.,.,.,.,.,.,.,.,.,.," +
    "Wh,Wh,Wh,Wh,Wh,Wh,Vr,Wh,Wh,Vw,Vs,Wh,Wh,Wh"
  ).split(","));
  const [entities, setEntities] = createSignal<string[]>(Array.from({ length: 14 * 9,  }, (_, k) => k === 43 ? "P" : "."));
  const [editorMode, setEditorMode] = createSignal<boolean>(true);

  
  return (
    <Switch>
      <Match when={editorMode()}>
        <VoidStrangerEditor tiles={tiles()} entities={entities()} setTiles={setTiles} setEntities={setEntities} switchToPlay={() => setEditorMode(false)} />
      </Match>
      <Match when={!editorMode()}>
        <VoidStrangerPlay tiles={tiles()} entities={entities()} switchToEditor={() => setEditorMode(true)} />
      </Match>
    </Switch>
  );
};

export const VoidStrangerPlay: Component<{ entities: string[], tiles: string[], switchToEditor: () => void }> = (
  props
) => {
  let engine: Engine;


  const [tiles, setTiles] = createSignal<Tile[]>([]);
  const [entities, setEntities] = createSignal<RegisteredEntity[][]>([]);
  const [debug, setDebug] = createSignal<boolean>(false);
  const [numberOfTurns, setNumberOfTurns] = createSignal(0);
  const [numberOfSteps, setNumberOfSteps] = createSignal(0);
  const [numberOfVoids, setNumberOfVoids] = createSignal(0);

  const keypressHandler = (ev: KeyboardEvent) => {
    switch (ev.key) {
    case "ArrowUp":
      engine.play(PlayerChoice.Up);
      break;
    case "ArrowDown":
      engine.play(PlayerChoice.Down);
      break;
    case "ArrowLeft":
      engine.play(PlayerChoice.Left);
      break;
    case "ArrowRight":
      engine.play(PlayerChoice.Right);
      break;
    case " ":
    case "w":
      engine.play(PlayerChoice.Action);
      break;
    case "r":
      try {
        engine = createEngine(props.entities, props.tiles);
        engine.start();
      } catch (err) {
        alert(err);
        props.switchToEditor();
        return;
      }
      break;
    case "e":
      if (ev.ctrlKey) {
        props.switchToEditor();
        return;
      }
      break;
    case "F2":
      setDebug(prev => !prev);
      break;
    default:
      return;
    }

    setTiles([...engine.tiles]);
    setEntities([...engine.entities]);
    setNumberOfVoids(engine.numberOfVoids);
    setNumberOfSteps(engine.numberOfSteps);
    setNumberOfTurns(engine.numberOfTurns);
  };

  onMount(() => {
    window.addEventListener("keydown", keypressHandler);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", keypressHandler);
  });

  createEffect(() => {
    try {
      engine = createEngine(props.entities, props.tiles);
      engine.start();
      setTiles([...engine.tiles]);
      setEntities([...engine.entities]);
      setNumberOfVoids(engine.numberOfVoids);
      setNumberOfSteps(engine.numberOfSteps);
      setNumberOfTurns(engine.numberOfTurns);
    } catch (err) {
      alert(err);
      props.switchToEditor();
      return;
    }
  });

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "justify-content": "center",
        "align-items": "center",
        height: "100%",
      }}
    >
      <div style={{display: "flex", gap: "1em", visibility: debug() ? "hidden": "visible"}}>
        <div style={{"color":"white", "font-size": "1.5em", padding: "1em"}}>
        T-<strong>{numberOfTurns().toString(10).padStart(5, "0")}</strong>
        </div>

        <div style={{"color":"white", "font-size": "1.5em", padding: "1em"}}>
        S-<strong>{numberOfSteps().toString(10).padStart(5, "0")}</strong>
        </div>

        <div style={{"color":"white", "font-size": "1.5em", padding: "1em"}}>
        V-<strong>{numberOfVoids().toString(10).padStart(5, "0")}</strong>
        </div>
      </div>
      <div style={{ display: "flex", "flex-direction": "column" }}>
        <For each={Array.from(chunk(zip(tiles(), entities()), WIDTH))}>
          {(chunk, row) => (
            <div style={{ display: "flex", "flex-direction": "row" }}>
              <For each={chunk}>
                {([tile, entitiesAt], col) => (
                  <div
                    style={{
                      display: "flex",
                      width: "60px",
                      height: "60px",
                      "image-rendering": "pixelated",
                      "background-position-x": "center",
                      "background-repeat": "no-repeat",
                      "background-size": "contain",
                      ...getBackgroundTile(tile, { 
                        row: row(), 
                        col: col(), 
                        tiles: engine.tiles, 
                        engine,
                        wingsCount:tiles()
                          .filter((_, index) => index < (row() * WIDTH) + col())
                          .filter((tile) => tile.name === "wings")
                          .length
                      }),
                    }}
                  >
                    <div
                      style={{
                        "font-size": "2em",
                        width: "100%",
                        height: "100%",
                        "background-position-x": "center",
                        "background-repeat": "no-repeat",
                        "background-size": "contain",
                        ...getBackgroundEntity(
                          entitiesAt.map((entity) => entity.entity),
                          { 
                            watcherCount: entities()
                              .filter((_, index) => index < (row() * WIDTH) + col())
                              .flat()
                              .filter((entity) => entity.entity.name === "watcher")
                              .length,
                            engine
                          }
                        ),
                      }}
                    />
                  </div>
                )}
              </For>
            </div>
          )}
        </For>
      </div>
      <div style={{color: "white", "margin-top": "20px"}}><strong>🢁 🢃 🢂 🢀</strong>: Move</div>
      <div style={{color: "white"}}><strong>Space</strong> or <strong>W</strong>: Action key</div>
      <div style={{color: "white"}}><strong>R</strong>: Reset level</div>
      <div style={{color: "white"}}><strong>Ctrl+E</strong>: Editor mode</div>
    </div>
  );
};

export const VoidStrangerEditor: Component<{ tiles: string[], entities: string[], setTiles: Setter<string[]>, setEntities: Setter<string[]>, switchToPlay: () => void }> = (
  props
) => {
  const searchableTiles = Array.from(TILES_MAPPING).map(([key, obj]) => ({ key, obj }));
  const searchableEntities = Array.from(ENTITIES_MAPPING).map(([key, obj]) => ({ key, obj }));

  const [searchValue, setSearchValue] = createSignal("");
  const [selectedKey, setSelectedKey] = createSignal({ key: ".", type: "tile" });

  const selectableTiles = createMemo(() => {
    let value = searchValue();
    return searchableTiles.filter(({ obj }) => 
      value.split(/\s+/).some(searchWord => 
        obj.keywords.split(/\s+/).find(
          keyword => keyword.toLowerCase().includes(searchWord.toLowerCase())
        )
      )
    );
  });

  const selectableEntities = createMemo(() => {
    let value = searchValue();
    return searchableEntities.filter(({ obj }) => 
      value.split(/\s+/).some(searchWord => 
        obj.keywords.split(/\s+/).find(
          keyword => keyword.toLowerCase().includes(searchWord.toLowerCase())
        )
      )
    );
  });

  const tiles = createMemo(() => {
    return props.tiles.map(tile => TILES_MAPPING.get(tile)!.invoke());
  });

  const entities = createMemo(() => {
    return props.entities.map(entity => ENTITIES_MAPPING.get(entity)!.invoke());
  });

  const keypressHandler = (ev: KeyboardEvent) => {
    if (ev.key === "p" && ev.ctrlKey) {
      ev.preventDefault();
      props.switchToPlay();
    }
  };

  const setTile = (key: string, row: number, col: number) => {
    props.setTiles((prev) => {
      const copy = prev.slice();
      copy[row * WIDTH + col] = key;
      return copy;
    });
  };

  const setEntity = (key: string, row: number, col: number) => {
    props.setEntities((prev) => {
      const copy = prev.slice();
      copy[row * WIDTH + col] = key;
      return copy;
    });
  };

  onMount(() => {
    window.addEventListener("keydown", keypressHandler);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", keypressHandler);
  });

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "row-reverse",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          width: "30%",
          "overflow-y": "auto",
          "border-left": "1px solid white",
          "box-shadow": "-1px -1px 15px white",
          padding: "5px 15px",
        }}
      >
        <div style={{display: "flex", "justify-content": "center", padding: "10px"}}>
          <input
            type="search"
            placeholder="Search objects..."
            value={searchValue()}
            onInput={(ev) => setSearchValue(ev.target.value)}
            style={{width: "80%", height: "40px", "font-size": "1.2em", "text-align": "center", "background-color": "#333", "color": "white"}}
          />
        </div>

        <h1 style={{color: "white"}}>TILES</h1>
        
        <div style={{"display": "flex", "flex-direction": "row", "flex-wrap": "wrap", "gap": "10px", "justify-content": "center"}}>
          <For each={selectableTiles()}>
            {({ key, obj }) => {
              let invoked = obj.invoke();
              let selected = () => key === selectedKey().key && selectedKey().type === "tile";
              return (<div><div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  width: "85px",
                  height: "85px",
                  border: "5px solid",
                  "border-color": selected() ? "white" : "#333",
                  "opacity": selected() ? 1 : 0.5,
                  "image-rendering": "pixelated",
                  "background-position-x": "center",
                  "background-repeat": "no-repeat",
                  "background-size": "contain",
                  ...getBackgroundTile(invoked),
                }}
                onClick={() => setSelectedKey({ key, type: "tile" })}
              />
              <div style={{color: selected() ? "white" : "#888", "line-break": "auto", "text-align": "center", "font-weight": "bold"}}>{obj.name}</div>
              </div>
              );}}
          </For>
        </div>

        <h1 style={{color: "white"}}>ENTITIES</h1>
        
        <div style={{"display": "flex", "flex-direction": "row", "flex-wrap": "wrap", "gap": "10px", "justify-content": "center"}}>
          <For each={selectableEntities()}>
            {({ key, obj }) => {
              let invoked = obj.invoke();
              let selected = () => key === selectedKey().key && selectedKey().type === "entity";
              return (<div><div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  width: "85px",
                  height: "85px",
                  border: "5px solid",
                  "border-color": selected() ? "white" : "#333",
                  "opacity": selected() ? 1 : 0.5,
                  "image-rendering": "pixelated",
                  "background-position-x": "center",
                  "background-repeat": "no-repeat",
                  "background-size": "contain",
                  ...getBackgroundEntity(invoked ? [invoked] : []),
                }}
                onClick={() => setSelectedKey({ key, type: "entity" })}
              />
              <div style={{color: selected() ? "white" : "#888", "line-break": "auto", "text-align": "center", "font-weight": "bold"}}>{obj.name}</div>
              </div>
              );}}
          </For>
        </div>

      </div>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          "justify-content": "center",
          "align-items": "center",
          height: "100%",
          "flex-grow": 1,
        }}
      >
        <div style={{ display: "flex", "flex-direction": "column" }}>
          <Index each={Array.from(chunk(zip(tiles(), entities()), WIDTH))}>
            {(chunk, row) => (
              <div style={{ display: "flex", "flex-direction": "row" }}>
                <Index each={chunk()}>
                  {(element, col) => <EditorTile 
                    col={col}
                    row={row}
                    tile={element()[0]}
                    entity={element()[1]}
                    selectedKey={selectedKey()}
                    setEntity={setEntity}
                    setTile={setTile}
                    tiles={tiles()}
                  />}
                </Index>
              </div>
            )}
          </Index>
        </div>
        <p style={{color: "white"}}><strong>Ctrl+P</strong>: Game mode</p>
      </div>
    </div>
  );
};


const EditorTile: Component<{ tile: Tile, entity: Entity | null, selectedKey: { key: string, type: string }, row: number, col: number, setTile: (key: string, row: number, col: number) => void, setEntity: (key: string, row: number, col: number) => void, tiles: Tile[] }> = (props) => {
  
  return <div
    draggable={false}
    classList={{"void-stranger": true, "editor-tile": true }}
    onMouseOver={(ev) => {
      if (Boolean(ev.buttons & 1) && props.selectedKey.type === "tile") {
        const key = props.selectedKey.key;
        props.setTile(key, props.row, props.col);
      }
      if (Boolean(ev.buttons & 1) && props.selectedKey.type === "entity") {
        const key = props.selectedKey.key;
        props.setEntity(key, props.row, props.col);
      }
    }}
    onMouseDown={(ev) => {
      if (Boolean(ev.buttons & 1) && props.selectedKey.type === "tile") {
        const key = props.selectedKey.key;
        props.setTile(key, props.row, props.col);
      }
      if (Boolean(ev.buttons & 1) && props.selectedKey.type === "entity") {
        const key = props.selectedKey.key;
        props.setEntity(key, props.row, props.col);
      }
    }}
  >
    <div
      draggable={false}
      class="void-stranger tile-layer"
      style={{
        ...getBackgroundTile(props.tile, { 
          row: props.row, 
          col: props.col, 
          tiles: props.tiles, 
          wingsCount: props.tiles
            .filter((_, index) => index < (props.row * WIDTH) + props.col)
            .filter((tile) => tile.name === "wings")
            .length
        }),
      }}
    >
      <div  
        draggable={false}
        class="void-stranger entity-layer"
        style={{
          "font-size": "2em",
          width: "100%",
          height: "100%",
          "background-position-x": "center",
          "background-repeat": "no-repeat",
          "background-size": "contain",
          ...getBackgroundEntity(props.entity ? [props.entity] : []),
        }}
      />

    </div>
  </div>;
};