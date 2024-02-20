import { DragDropProvider, DragDropSensors, DragEventHandler, DragOverlay, closestCenter, createDraggable, createDroppable } from "@thisbeyond/solid-dnd";
import { Component, Match, Show, createSignal, Switch, onCleanup, onMount, Index } from "solid-js";
import { Letter } from "../Letter";
import { chunks, fromVoidStrangerLetter, isOrdered, toVoidStrangerLetter } from "../../../utils";

// Asset files
import emptyBrandImg from "../../../assets/emptybrand.png";

// CSS files
import "./index.css";

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

  const [text, setText] = createSignal("");
  const [blocks, setBlocks] = createSignal<BlockProps[]>([]);
  const [activeBlock, setActiveBlock] = createSignal<LetterBlockProps>();
  const [pixelScale, setPixelScale] = createSignal<number>(0);
  const [pixelOffset, setPixelOffset] = createSignal<{ left:number, top: number }>({ left: 0, top: 0});

  const applyText = () => {
    const bl: LetterBlockProps[] = text()
      .split("")
      .map((element) => toVoidStrangerLetter(element.toUpperCase()))
      .filter((element): element is number => element !== null)
      .map((element, index) => ({ type: "letter", value: element, id: index + 1, pixelScale: 0 }));

    
    const remainings: EmptyBlockProps[] = Array.from({ length: 6 * 6 - bl.length }, (_, k) => ({ type: "empty", id: bl.length + k + 1, pixelScale: 0 }));

    setBlocks([...bl, ...remainings]);
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
          setBlocks(copy);
        }
      }
    }
    setActiveBlock(undefined);
  };

  const chunksOfBlocks = () => chunks(blocks(), 6);

  const displayedSentence = () => blocks()
    .filter((block): block is LetterBlockProps => block.type === "letter")
    .map(block => block.value)
    .map(value => fromVoidStrangerLetter(value));

  onMount(() => {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = makeRect(132.0, 100.0, entry.target.getBoundingClientRect().width, entry.target.getBoundingClientRect().height);
        setPixelOffset({ left: rect.left, top: rect.top });
        setPixelScale(rect.height / 100.0);
      }
    });

    if (brandRef) {
      const rect = makeRect(132.0, 100.0, brandRef.getBoundingClientRect().width, brandRef.getBoundingClientRect().height);
      setPixelOffset({ left: rect.left, top: rect.top });
      setPixelScale(rect.height / 100.0);
      resizeObserver.observe(brandRef);
    }
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
  });

  const genSize = (size: number) => (pixelScale() * size); 

  return (
    <div style={{display: "flex", "flex-direction": "column", height: "100%"}}>
      <div style={{"flex-shrink": 1}}>
        <input type="text" value={text()} onInput={(ev) => setText(ev.target.value)} />
        <button onClick={applyText}>Apply</button>
      </div>
      <div style={{"flex-shrink": 1}}>
        <p><b>Displayed sentence</b>: {displayedSentence()}</p>
      </div>
      <div style={{"flex-grow": 1,}}>
        <div ref={brandRef} style={{"background-image": `url(${emptyBrandImg})`}} class="brand">
          <DragDropProvider collisionDetector={closestCenter} onDragEnd={onDragEnd} onDragStart={onDragStart}>
            <DragDropSensors />
            <Index each={chunksOfBlocks()}>
              {(chunkOfBlocks, y) => 
                <Index each={chunkOfBlocks()}>
                  {(block, x) => <div style={{position: "absolute", top: (pixelOffset().top + genSize(26 + x * 8)) + "px", left: (pixelOffset().left + genSize(42 + (5 - y) * 8 )) + "px"}}>
                    <CommonBlock {...block()} pixelScale={pixelScale()}  />
                  </div>} 
                </Index>
              }
            </Index>
            <DragOverlay>
              <Show when={activeBlock()}>
                {(block) => <Letter value={block().value} pixelScale={pixelScale()} />}
              </Show>
            </DragOverlay>
          </DragDropProvider>
        </div>
      </div>
    </div>
  );
};