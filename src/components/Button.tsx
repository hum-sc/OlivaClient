import { useState } from 'react';
import '../styles/Button.css'
export type ButtonProps = {
    type?: 'default' | 'toggle';
    color?: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
    size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
    shape?: 'rounded' | 'squared';
    onClick: ()=>void;
    text: string;
    icon?: string;
    disabled?: boolean;
}
export default function Button({
    onClick,
    text,
    icon,
    type='default',
    color='filled',
    size='small',
    shape='rounded',
    disabled=false,
}:ButtonProps){
    
    const [isSelected, setIsSelected] = useState(false);
    const handleOnClick = () => {
        setIsSelected(!isSelected);
        onClick();
    }
    return <button disabled={disabled} onClick={handleOnClick} className={`${type} ${color} ${size} ${shape} ${isSelected? "selected":"unselected"}`}>
        {icon&&<span className="material-symbols-outlined">{icon}</span>}
        <p>{text}</p>
        <div className="stateLayer"/>
    </button>

}