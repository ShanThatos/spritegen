import { ComponentProps, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";

export const classed = new Proxy<any>({}, {
  get: (_target, tagName) => {
    const tag = tagName as ValidComponent;
    return (classes: string) => {
      return (props: ComponentProps<typeof tag>) => {
        props.class = `${classes} ${props.class ?? ""}`;
        return <Dynamic component={tagName} {...props} />;
      };
    };
  }
});
