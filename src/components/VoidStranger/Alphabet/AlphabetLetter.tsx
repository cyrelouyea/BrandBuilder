import { Component, Show } from "solid-js";
import { Letter } from "../Letter";
import { toVoidStrangerLetter } from "../../../utils";

export const AlphabetLetter: Component<{ letter: string; }> = (props) => {

  const voidStrangerValue = () => toVoidStrangerLetter(props.letter);

  return (
    <Show when={voidStrangerValue()} fallback={<div>InvalidValue</div>}>
      {(value) => <div>
        <Letter value={value()} />
        <div style={{ "text-align": "center" }}>{props.letter}</div>
      </div>}
    </Show>
  );

};
