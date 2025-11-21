import { type ComponentPropsWithRef, type ElementType, type PropsWithChildren} from "react";
// Extend props from T

export type EditableComponentProps<T extends ElementType> = PropsWithChildren<ComponentPropsWithRef<T>> & {
    el?: T;
}
export function EditableComponent<T extends ElementType>(props: EditableComponentProps<T>) {
    const { el: Component ="div", key, children, ...rest } = props;

    return <Component key={key} {...rest} contentEditable={true} suppressContentEditableWarning={true}>{children}</Component>;
}