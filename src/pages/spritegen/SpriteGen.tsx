import Jimp from "jimp/browser/lib/jimp";
import { createSignal, For, Show } from "solid-js";

import { classed } from "../../utils/componentutils";
import { Nullable } from "../../utils/typeutils";
import "./spritegen.scss";
import { addFrames, generateSpriteSheet, SGState, SpriteGenFrame } from "./SpriteGenContext";


const FramesContainer = classed.div`m-3 flex-fill d-flex flex-row flex-wrap justify-content-center align-items-center gap-3`;
const Frame = classed.div`border border-2 border-info rounded-3 overflow-hidden`;
const FrameContentContainer = classed.div`d-flex flex-column justify-content-evenly align-items-center p-2 gap-2`;

const MainButtonContainer = classed.div`col-6 d-grid`;
const MainButton = classed.button`btn btn-block btn-primary btn-lg`;


export const SpriteGen = () => {

  const [isLoading, setIsLoading] = createSignal(false);
  const [finalImage, setFinalImage] = createSignal("");

  const captureIsLoading = (func: any) => {
    return async () => {
      setIsLoading(true);
      await func();
      setIsLoading(false);
    };
  };

  const loadAndAddFiles = async (files: Nullable<FileList>) => {
    if (!files || files.length === 0) {
      console.log("no files");
      return;
    }

    setIsLoading(true);

    const promises: Array<Promise<SpriteGenFrame>> = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const name = file.name;
      promises.push((async () => {
        const image = await Jimp.read(URL.createObjectURL(file));
        return { name, image };
      })());
    }
    const frames = await Promise.all(promises);

    const inputEl = uploadFilesInput as HTMLInputElement;
    inputEl.value = "";

    addFrames(frames, () => {
      setIsLoading(false);
    });
  };

  let uploadFilesButton: any;
  let uploadFilesInput: any;

  const uploadOnClick = async () => {
    uploadFilesInput.click();
  };
  const uploadInputOnChange = async () => {
    loadAndAddFiles((uploadFilesInput as HTMLInputElement).files);
  };

  const dropHandler = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer)
      loadAndAddFiles(e.dataTransfer.files);
  };
  
  const dragoverHandler = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer)
      e.dataTransfer.dropEffect = "move";
  };

  const generateOnClick = captureIsLoading(async () => {
    const image = await generateSpriteSheet();
    const dataUrl = await image.getBase64Async(Jimp.MIME_PNG);
    setFinalImage(dataUrl);
  });

  return (
    <div class="m-5">
      <h1 class="text-center fw-bold">
        Welcome to Sprite Gen V1
      </h1>

      <div class="mx-auto" style={{ "max-width": "1400px" }}>
        <div 
          class="mt-5 drag-drop"
          ondrop={dropHandler}
          ondragover={dragoverHandler}
        >
          <div class="d-flex flex-column align-items-stretch">
            <FramesContainer>
              <For each={SGState.frames}>
                {(item) => (
                  <Frame style={{ width: "10%", "min-width": "180px" }}>
                    <FrameContentContainer>
                      <div>
                        <img class="w-100 border border-1 border-info rounded-3 bg-dark" alt={item.name} src={item.previewBase64} />
                      </div>
                      <div class="flex-fill d-flex justify-content-center align-items-center">
                        <label>{item.name}</label>
                      </div>
                    </FrameContentContainer>
                  </Frame>
                )}
              </For>
            </FramesContainer>
          </div>
        </div>
        <div class="mt-3 w-75 mx-auto row">
          <MainButtonContainer>
            <MainButton ref={uploadFilesButton} class="btn-primary" onclick={uploadOnClick} disabled={isLoading()}>Upload</MainButton>
            <input ref={uploadFilesInput} type="file" accept="image/*" onchange={uploadInputOnChange} multiple hidden/>
          </MainButtonContainer>
          <MainButtonContainer>
            <MainButton class="btn-success" onclick={generateOnClick} disabled={isLoading()}>Generate</MainButton>
          </MainButtonContainer>
        </div>
        <div class="m-4">
          <Show when={finalImage()}>
            <img class="w-100 border border-1 border-info rounded-3 bg-dark" src={finalImage()} alt="final image" />
          </Show>
        </div>
      </div>
    </div>
  );

};
