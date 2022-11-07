import { createStore } from "solid-js/store";
import Jimp from "jimp/browser/lib/jimp";



export interface SpriteGenFrame {
  name: string;
  image: Jimp;
  previewBase64?: string;
}

export interface SpriteGenState {
  frames: Array<SpriteGenFrame>;
}


const [SGState, setSGState] = createStore<SpriteGenState>({
  frames: []
});

export { SGState };

export const getFrameSize = () => {
  if (SGState.frames.length > 0)
    return [SGState.frames[0].image.getWidth(), SGState.frames[0].image.getHeight()];
  return [0, 0];
};

export const addFrame = async (frame: SpriteGenFrame) => {
  const image = frame.image;

  if (SGState.frames.length > 0) {
    const [width, height] = getFrameSize();

    if (image.getWidth() !== width || image.getHeight() !== height) 
      throw new Error("All existing and new frames must be the same size");
    
    let nameSuffix = 0;
    const frameName = () => (nameSuffix === 0 ? frame.name : `${frame.name} (${nameSuffix})`);

    while (SGState.frames.some(fr => fr.name === frameName()))
      nameSuffix++;
    
    frame.name = frameName();
  }

  frame.previewBase64 = await image.getBase64Async(Jimp.MIME_PNG);
  setSGState("frames", [...SGState.frames, frame]);
};

export const addFrames = async (frames: Array<SpriteGenFrame>, callback: any = undefined) => {
  let i = 0;
  const addNextFrame = async () => {
    if (i < frames.length) {
      await addFrame(frames[i]);
      i++;
      setTimeout(addNextFrame, 0);
    } else if (callback) {
      callback();
    }
  };
  
  addNextFrame();
};

export const generateSpriteSheet = async () => {
  if (SGState.frames.length === 0) 
    throw new Error("No frames to generate sprite sheet from");

  const [width, height] = getFrameSize();
  const numFrames = SGState.frames.length;
  const numRows = Math.ceil(Math.sqrt(numFrames));
  const numCols = Math.ceil(numFrames / numRows);

  const image = await Jimp.create(width * numCols, height * numRows);

  for (let i = 0, r = 0; r < numRows && i < numFrames; r++) 
    for (let c = 0; c < numCols && i < numFrames; c++, i++) 
      image.blit(SGState.frames[i].image, c * width, r * height);
  
  return image;
};