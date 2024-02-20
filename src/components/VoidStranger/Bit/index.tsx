import { Component } from "solid-js";
import { LetterProps } from "../Letter";
import "./index.css";

export interface BitProps {
    value: boolean;
    pixelScale: number;
}

export const Bit: Component<BitProps> = (props) => {
  return (
    <div
      style={{ width: `${props.pixelScale}px`, height: `${props.pixelScale}px` }}
      classList={{
        "void-stranger-bit-on": props.value
      }}
      class="void-stranger-bit" />
  );
};

export const BitAtPosition: Component<
  LetterProps & { position: number; }
> = (props) => {
  const value = () => (props.value & (1 << props.position)) != 0;
  return <Bit value={value()} pixelScale={props.pixelScale} />;
};