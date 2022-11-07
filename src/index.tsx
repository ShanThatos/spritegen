/* @refresh reload */
import { render } from "solid-js/web";

import "./index.scss";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as bootstrap from "bootstrap";

import { SpriteGen } from "./pages/spritegen/SpriteGen";

render(() => (<SpriteGen />), document.getElementById("root") as HTMLElement);

