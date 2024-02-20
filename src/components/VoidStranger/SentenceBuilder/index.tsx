import { Component, createSignal, createMemo, For, Show } from "solid-js";
import { chunks, toVoidStrangerLetter } from "../../../utils";
import { Letter } from "../Letter";

export const SentenceBuilder: Component = () => {
  const [value, setValue] = createSignal("mon was here");
  const [nbRows, setNbRows] = createSignal(3);

  const chunksOfLetters = createMemo(() =>
    chunks(
      value()
        .split("")
        .map((element) => toVoidStrangerLetter(element.toUpperCase()))
        .filter((element) => element !== null),
      nbRows()
    )
  );

  return (
    <div
      style={{ height: "100%", display: "flex", "flex-direction": "column" }}
    >
      <div style={{ "flex-shrink": 1 }}>
        <input
          type="text"
          value={value()}
          onInput={(ev) => setValue(ev.target.value)}
        />
        <input
          type="number"
          value={nbRows()}
          onInput={(ev) => setNbRows(ev.target.valueAsNumber)}
        />
      </div>

      <div
        style={{
          "flex-grow": 1,
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
        }}
      >
        <div
          style={{
            display: "flex",
            "flex-wrap": "wrap",
            "justify-content": "center",
            "flex-direction": "row-reverse",
          }}
        >
          <For each={chunksOfLetters()}>
            {(chunk) => (
              <div style={{ display: "flex", "flex-flow": "column" }}>
                <For each={chunk}>
                  {(element) => (
                    <Show when={element} fallback={"Invalid value"}>
                      {(letter) => <Letter value={letter()} />}
                    </Show>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
