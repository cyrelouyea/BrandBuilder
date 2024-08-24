import { DragDropProvider, DragDropSensors, DragEventHandler, DragOverlay, closestCenter, createDraggable, createDroppable } from "@thisbeyond/solid-dnd";
import { Component, Match, Show, createSignal, Switch, onCleanup, onMount, Index, For, createEffect } from "solid-js";
import { Letter } from "../Letter";
import { chunks, fromVoidStrangerLetter, isOrdered, toVoidStrangerLetter } from "../../../utils";
import { useSearchParams } from "@solidjs/router";
import { BRANDS } from "../../brands";
import { plausible } from "../../../plausible";

// Asset files
import emptyBrandImg from "../../../assets/emptybrand.png";

// CSS files
import "./index.css";

const BRAND_IMAGE_WIDTH = 132;
const BRAND_IMAGE_HEIGHT = 100;

export interface LetterBlockProps {
  type: "letter"
  id: number
  value: number
  pixelScale: number
}

export interface EmptyBlockProps {
  type: "empty"
  id: number
  pixelScale: number
}

type BlockProps = LetterBlockProps | EmptyBlockProps;


export const DraggableLetterBlock: Component<LetterBlockProps> = (props) => {
  const draggable = createDraggable(props.id);
  return <div ref={draggable} classList={{ "preview-letter": draggable.isActiveDraggable }}>
    <Letter value={props.value} pixelScale={props.pixelScale} />
  </div>;
};

export const LetterBlock: Component<LetterBlockProps> = (props) => {
  const droppable = createDroppable(props.id);

  
  return <div ref={droppable} classList={{ "preview-letter": droppable.isActiveDroppable }}>
    <DraggableLetterBlock {...props} />
  </div>; 
};

export const EmptyBlock: Component<EmptyBlockProps> = (props) => {
  const droppable = createDroppable(props.id);

  return <div ref={droppable} classList={{ "preview-empty": droppable.isActiveDroppable }}>
    <div style={{"background-color": "transparent", width: (props.pixelScale * 7) + "px", height: (props.pixelScale * 7) + "px"}} />
  </div>; 
};


export const CommonBlock: Component<BlockProps> = (props) => {
  return <Switch>
    <Match when={props.type === "empty" ? props : false}>
      {(emptyBlock) => <EmptyBlock {...emptyBlock()} />}
    </Match>
    <Match when={props.type === "letter" ? props : false}>
      {(letterBlock) => <LetterBlock {...letterBlock()} />}
    </Match>
  </Switch>;
};


function makeRect(originalWidth: number, originalHeight: number, targetWidth: number, targetHeight: number): { left: number, top: number, width: number, height: number } {
  let width: number, height: number;
  
  if (targetWidth / targetHeight > originalWidth / originalHeight) {
    // target width  is greater than image width
    width = originalWidth * targetHeight / originalHeight;
    height = targetHeight;
  } else {
    // target height is greater than image height 
    width = targetWidth;
    height = originalHeight * targetWidth / originalWidth;
  }

  return {
    left: Math.abs(width - targetWidth) / 2,
    top: Math.abs(height - targetHeight) / 2,
    width,
    height
  };
}
export const BrandBuilder: Component = () => {

  let resizeObserver: ResizeObserver | undefined;
  let brandRef: HTMLDivElement | undefined;

  const [params, setParams] = useSearchParams<{ q: string }>();
  const [activeBlock, setActiveBlock] = createSignal<LetterBlockProps>();
  const [pixelScale, setPixelScale] = createSignal<number>(0);
  const [pixelOffset, setPixelOffset] = createSignal<{ left:number, top: number }>({ left: 0, top: 0});


  const blocks = () => {
    const bl: BlockProps[] = (params.q ?? "")
      .split("")
      .map((element) => toVoidStrangerLetter(element.toUpperCase()))
      .map((element, index) => 
        element !== null ? 
          { type: "letter", value: element, id: index + 1, pixelScale: 0 }
          : { type: "empty", id: index + 1, pixelScale: 0 });
  
    const remainings: EmptyBlockProps[] = Array.from({ length: 6 * 6 - bl.length }, (_, k) => ({ type: "empty", id: bl.length + k + 1, pixelScale: 0 }));

    return [...bl, ...remainings].slice(0, 6 * 6);
  };
  
  const onDragStart: DragEventHandler = ({ draggable }) => {
    const block = blocks().find(el => el.id === draggable.id);

    if (block?.type === "letter") {
      setActiveBlock(block);
    }
  };

  const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
    
    if (draggable && droppable) {
      const _blocks = blocks();
      const fromIndex = _blocks.findIndex(el => el.id === draggable.id);
      const toIndex = _blocks.findIndex(el => el.id === droppable.id);
      
      if (fromIndex !== toIndex) {
        const copy = _blocks.slice();
        const temp = copy[fromIndex];
        copy[fromIndex] = copy[toIndex];
        copy[toIndex] = temp;

        if (isOrdered(copy.filter((block) => block.type === "letter").map(block => block.id))) {
          const newPattern = copy.map(block => block.type === "empty" ? "." : (fromVoidStrangerLetter(block.value)) || ".").join("");
          setParams({ q: newPattern });
          plausible.trackEvent("brand", { props: { pattern: newPattern }});
        }
      }
    }
    setActiveBlock(undefined);
  };


  onMount(() => {
    function resize(element: Element) {
      const rect = makeRect(BRAND_IMAGE_WIDTH, BRAND_IMAGE_HEIGHT, element.getBoundingClientRect().width, element.getBoundingClientRect().height);
      setPixelOffset({ left: rect.left, top: rect.top });
      setPixelScale(rect.height / BRAND_IMAGE_HEIGHT);
    }

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        resize(entry.target);
      }
    });

    if (brandRef) {
      resize(brandRef);
      resizeObserver.observe(brandRef);
    }
    
    plausible.trackPageview();
    plausible.trackEvent("brand", { props: { pattern: params.q ?? "" }});
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
  });

  const genSize = (size: number) => (pixelScale() * size); 
  const topSize = (x: number) => pixelOffset().top + genSize(26 + x * 8);
  const leftSize = (y: number) => pixelOffset().left + genSize(42 + (5 - y) * 8);
  const chunksOfBlocks = () => chunks(blocks(), 6);

  return (
    <div style={{display: "flex", "flex-direction": "column", height: "100%"}}>
      <div style={{"flex-grow": 1}}>
        <DragDropProvider collisionDetector={closestCenter} onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <DragDropSensors />
          <div ref={brandRef} class="brand" style={{"background-image": `url(${emptyBrandImg})`}}>
            <For each={BRANDS}>{brand => <div class="brand" style={{
              "position": "absolute", 
              "background-image": `url(${brand.url})`, 
              "opacity": brand.pattern === blocks().map(block => block.type === "empty" ? "0" : "1").join("") ? 1 : 0 }} 
            />}
            </For>
            <Index each={chunksOfBlocks()}>
              {(chunkOfBlocks, y) => 
                <Index each={chunkOfBlocks()}>
                  {(block, x) => <div style={{position: "absolute", top: topSize(x) + "px", left: leftSize(y) + "px"}}>
                    <CommonBlock {...block()} pixelScale={pixelScale()}  />
                  </div>} 
                </Index>
              }
            </Index>
          </div>
          <DragOverlay>
            <Show when={activeBlock()}>
              {(block) => <Letter value={block().value} pixelScale={pixelScale()} />}
            </Show>
          </DragOverlay>
        </DragDropProvider>
      </div>
    </div>
  );
};