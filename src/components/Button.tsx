import { useState } from 'react';
import '../styles/Button.css'
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    buttonType?: 'default' | 'toggle';
    color?: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
    size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
    shape?: 'rounded' | 'squared';
    onClick: ()=>void;
    text?: string | undefined;
    icon?: string;
    disabled?: boolean;
} ;

export default function Button({
    onClick = ()=>{},
    text= undefined,
    icon = undefined,
    buttonType='default',
    color='filled',
    size='small',
    shape='rounded',
    disabled=false,
    ...rest
}:ButtonProps){
    
    const [isSelected, setIsSelected] = useState(false);
    const handleOnClick = () => {
        setIsSelected(!isSelected);
        onClick();
    }
    const child = text || rest.children;
    return <button disabled={disabled} onClick={handleOnClick} className={`${buttonType} ${color} ${size} ${shape} ${isSelected? "selected":"unselected"}`} {...rest}>
        {icon&&<span className="material-symbols-outlined">{icon}</span>}
        <p>{child}</p>
        <div className="stateLayer"/>
    </button>

}