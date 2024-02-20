import { Bit, BitAtPosition } from "../Bit";

import { Component, createMemo } from "solid-js";

export interface LetterProps {
  value: number;
  setValue?: (fn: (prevValue: number) => number) => void;
  pixelScale: number
}

export const Letter: Component<LetterProps> = (
  props
) => {
  const genSize = (size: number) => (props.pixelScale * size) + "px"; 

  const bigSquareSize = createMemo(() => genSize(7));
  const squareSize = createMemo(() => genSize(6));
  const smSquareSize = createMemo(() => genSize(5));
  const padding = createMemo(() => genSize(1));

  return (
    <div style={{position: "relative", width: bigSquareSize(), height: bigSquareSize() }}>
      <div style={{position: "absolute", left: 0, top: 0, width: bigSquareSize(), height: bigSquareSize(), "background-color": "#808080" }} />
      <div style={{position: "absolute", right: 0, bottom: 0, width: squareSize(), height: squareSize(), "background-color": "#ffffff" }} />
      <div style={{position: "absolute", left: padding(), bottom: padding(), width: smSquareSize(), height: smSquareSize(), "background-color": "#c0c0c0" }} />

      <div style={{position: "absolute", left: genSize(1), top: genSize(1) }}>
        <Bit value={true} pixelScale={props.pixelScale} />
      </div>

      <div style={{position: "absolute", left: genSize(3), top: genSize(1) }}>
        <Bit value={false} pixelScale={props.pixelScale} />
      </div>

      <div style={{position: "absolute", left: genSize(5), top: genSize(1) }}>
        <Bit value={false} pixelScale={props.pixelScale} />
      </div>


      <div style={{position: "absolute", left: genSize(1), top: genSize(3) }} >
        <BitAtPosition
          position={4}
          value={props.value}
          setValue={props.setValue}
          pixelScale={props.pixelScale}
        />
      </div>


      <div style={{position: "absolute", left: genSize(5), top: genSize(3) }}>
        <BitAtPosition
          position={3}
          value={props.value}
          setValue={props.setValue}
          pixelScale={props.pixelScale}
        />
      </div>

      <div style={{position: "absolute", left: genSize(1), top: genSize(5) }}>
        <BitAtPosition
          position={2}
          value={props.value}
          setValue={props.setValue}
          pixelScale={props.pixelScale}
        /></div>

      <div style={{position: "absolute", left: genSize(3), top: genSize(5) }}>
        <BitAtPosition
          position={0}
          value={props.value}
          setValue={props.setValue}
          pixelScale={props.pixelScale}
        /></div>

      <div style={{position: "absolute", left: genSize(5), top: genSize(5) }}>
        <BitAtPosition
          position={1}
          value={props.value}
          setValue={props.setValue}
          pixelScale={props.pixelScale}
        /></div>
    </div>
  );
};
