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
} from "solid-js";
import {
  BombTile,
  Direction,
  EmptyTile,
  Engine,
  Entity,
  ExploTile,
  GlassTile,
  LazyEye,
  Leech,
  NormalTile,
  PlayerChoice,
  RegisteredEntity,
  RegisteredTile,
  Rock,
  Stair,
  Tile,
  VoidPlayer,
  WallTile,
} from "./engine";

import boulderImg from "../../../assets/tiles/boulder.png";
import exitImg from "../../../assets/tiles/exit.png";
import floorImg from "../../../assets/tiles/floor.png";
import glassImg from "../../../assets/tiles/glass.png";
import damagedGlassImg from "../../../assets/tiles/damagedglass.png";
import bombImg from "../../../assets/tiles/bomb.png";
import exploImg from "../../../assets/tiles/explo.png";

import leechLeftImg from "../../../assets/tiles/leech-left.png";
import leechRightImg from "../../../assets/tiles/leech-right.png";
import playerDownImg from "../../../assets/tiles/player-down.png";
import playerUpImg from "../../../assets/tiles/player-up.png";
import playerRightImg from "../../../assets/tiles/player-right.png";
import playerLeftImg from "../../../assets/tiles/player-left.png";
import lazyEyeImg from "../../../assets/tiles/lazyeye.png";

const WIDTH = 14;


const TILES_MAPPING = new Map<string, { invoke: () => Tile, keywords: string, name: string }>([
  ["W", { invoke: () => new WallTile(), keywords: "wall obstacle blocking", name: "Wall" }],
  [".", { invoke: () => new NormalTile(), keywords: "normal", name: "Normal"  }],
  ["E", { invoke: () => new Stair(), keywords: "hole space empty", name: "Stairs" }],
  [" ", { invoke: () => new EmptyTile(), keywords: "stairs exit", name: "Hole" }],
  ["G", { invoke: () => new GlassTile(), keywords: "glass ice", name: "Glass" }],
  ["B", { invoke: () => new BombTile(), keywords: "bomb explo", name: "Bomb" }],
  ["Be", { invoke: () => new ExploTile(), keywords: "bomb explo", name: "Explo" }],
]);

const ENTITIES_MAPPING = new Map<string, { invoke: () => Entity | null, keywords: string, name: string }>([
  [".", { invoke: () => null, keywords: "remove nothing", name: "None" }],
  ["R", { invoke: () => new Rock(), keywords: "rock boulder egg", name: "Boulder" }],
  ["P", { invoke: () => new VoidPlayer(), keywords: "player", name: "Player" }],
  ["Ll", { invoke: () => new Leech(false), keywords: "leech snake enemy left", name: "Leech (left)" }],
  ["Lr", { invoke: () => new Leech(true), keywords: "leech snake enemy right", name: "Leech (right)" }],
  ["E", { invoke: () => new LazyEye(), keywords: "lazy eye enemy", name: "Lazy Eye" }]
]);


function zip<T1, T2>(first: T1[], second: T2[]): [T1, T2][] {
  return first.map((k, i) => [k, second[i]]);
}

function* chunk<T>(array: T[], size: number): IterableIterator<T[]> {
  for (let i = 0; i < array.length; i += size) {
    yield array.slice(i, i + size);
  }
}

function getBackgroundTile(tile: Tile): JSX.CSSProperties {
  switch (tile.name) {
  case "wall":
    return { "background-color": "#333" };
  case "normal":
    return {
      "background-image": "url(" + floorImg + ")",
      "background-size": "cover",
    };
  case "stair":
    return {
      "background-image": "url(" + exitImg + ")",
      "background-size": "cover",
    };
  case "glass":
    return {
      "background-image": "url(" + glassImg + ")",
      "background-size": "cover",
    };
  case "damagedglass":
    return {
      "background-image": "url(" + damagedGlassImg + ")",
      "background-size": "cover",
    };
  case "bomb":
    return {
      "background-image": "url(" + bombImg + ")",
      "background-size": "cover",
    };
  case "explo":
    return {
      "background-image": "url(" + exploImg + ")",
      "background-size": "cover",
    };
  default:
    return { "background-color": "transparent" };
  }
}

function getBackgroundEntity(entities: Entity[]): JSX.CSSProperties {
  if (entities.length === 0) {
    return {};
  }

  const entity = entities[0];

  switch (entity.name) {
  case "rock":
    return {
      "background-image": "url(" + boulderImg + ")",
      "background-size": "cover",
    };

  case "lazyeye":
    return {
      "background-image": "url(" + lazyEyeImg + ")",
      "background-size": "cover",
    };
  case "leech":
    if (entity.facing === Direction.Left) {
      return {
        "background-image": "url(" + leechLeftImg + ")",
        "background-size": "cover",
      };
    } else {
      return {
        "background-image": "url(" + leechRightImg + ")",
        "background-size": "cover",
      };
    }
  case "player":
    if (entity.facing === Direction.Down) {
      return {
        "background-image": "url(" + playerDownImg + ")",
        "background-size": "cover",
      };
    } else if (entity.facing === Direction.Up) {
      return {
        "background-image": "url(" + playerUpImg + ")",
        "background-size": "cover",
      };
    } else if (entity.facing === Direction.Left) {
      return {
        "background-image": "url(" + playerLeftImg + ")",
        "background-size": "cover",
      };
    } else {
      return {
        "background-image": "url(" + playerRightImg + ")",
        "background-size": "cover",
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
  });
}

export const VoidStrangerGame: Component = () => {
  
  const [tiles, setTiles] = createSignal<string[]>(Array.from({ length: 14 * 8 }, () => "."));
  const [entities, setEntities] = createSignal<string[]>(Array.from({ length: 14 * 8,  }, (_, k) => k === 43 ? "P" : "."));
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


  const [tiles, setTiles] = createSignal<RegisteredTile[]>([]);
  const [entities, setEntities] = createSignal<RegisteredEntity[][]>([]);

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
    default:
      return;
    }

    setTiles([...engine.tiles]);
    setEntities([...engine.entities]);
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
      setTiles([...engine.tiles]);
      setEntities([...engine.entities]);
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
      <div style={{ display: "flex", "flex-direction": "column" }}>
        <For each={Array.from(chunk(zip(tiles(), entities()), WIDTH))}>
          {(chunk) => (
            <div style={{ display: "flex", "flex-direction": "row" }}>
              <For each={chunk}>
                {([tile, entitiesAt]) => (
                  <div
                    style={{
                      display: "flex",
                      width: "60px",
                      height: "60px",
                      "image-rendering": "pixelated",
                      ...getBackgroundTile(tile.tile),
                    }}
                  >
                    <div
                      style={{
                        "font-size": "2em",
                        width: "100%",
                        height: "100%",
                        ...getBackgroundEntity(
                          entitiesAt.map((entity) => entity.entity)
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
          <For each={Array.from(chunk(zip(tiles(), entities()), WIDTH))}>
            {(chunk, row) => (
              <div style={{ display: "flex", "flex-direction": "row" }}>
                <For each={chunk}>
                  {([tile, entity], col) => (
                    <div
                      style={{
                        display: "flex",
                        width: "57px",
                        height: "57px",
                        border: "1px solid #ccc",
                        margin: "2px",
                        "image-rendering": "pixelated",
                        ...getBackgroundTile(tile),
                      }}
                      onMouseOver={(ev) => {
                        if (Boolean(ev.buttons & 1) && selectedKey().type === "tile") {
                          const key = selectedKey().key;
                          setTile(key, row(), col());
                        }
                        if (Boolean(ev.buttons & 1) && selectedKey().type === "entity") {
                          const key = selectedKey().key;
                          setEntity(key, row(), col());
                        }
                        if (ev.buttons & 2) {
                          setEntity(".", row(), col());
                        }
                      }}
                      onMouseDown={(ev) => {
                        if (Boolean(ev.buttons & 1) && selectedKey().type === "tile") {
                          const key = selectedKey().key;
                          setTile(key, row(), col());
                        }
                        if (Boolean(ev.buttons & 1) && selectedKey().type === "entity") {
                          const key = selectedKey().key;
                          setEntity(key, row(), col());
                        }
                        if (ev.buttons & 2) {
                          if (selectedKey().type === "entity") {
                            setEntity(".", row(), col());
                          }
                        }
                      }}
                      onContextMenu={(ev) => { ev.preventDefault(); }}
                    >
                      <div
                        style={{
                          "font-size": "2em",
                          width: "100%",
                          height: "100%",
                          ...getBackgroundEntity(entity ? [entity] : []),
                        }}
                      />
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
        <p style={{color: "white"}}><strong>Ctrl+P</strong>: Game mode</p>
      </div>
    </div>
  );
};
