import { Component, Show, createSignal, For } from "solid-js";
import { Letter } from "../Letter";
import { fromVoidStrangerLetter } from "../../../utils";
import { AlphabetLetter } from "./AlphabetLetter";


export const Alphabet: Component = () => {
  const [value, setValue] = createSignal(0x01);

  const voidStrangerLetter = () => fromVoidStrangerLetter(value());

  return <div>
    <div>
      <h3>Create your letter</h3>
      <div style={{ display: "flex", "justify-content": "center" }}>
        <div>
          <Letter value={value()} setValue={setValue} pixelScale={15} />
          <Show when={voidStrangerLetter()} fallback={<div style={{ "text-align": "center" }}>Invalid Value</div>}>
            {(letter) => <div style={{ "text-align": "center" }}>{letter()}</div>}
          </Show>
        </div>
      </div>

    </div>
    <div>
      <h3>Alphabet</h3>
      <div style={{ display: "flex", "flex-wrap": "wrap", "justify-content": "center" }}>
        <For each={"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")}>{letter => <div style={{ "padding-bottom": "1em", "padding-left": "0.5em", "padding-right": "0.5em" }}>
          <AlphabetLetter letter={letter} />
        </div>}</For>
      </div>
    </div>
  </div>;
};