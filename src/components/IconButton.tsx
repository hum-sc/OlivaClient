import type { HTMLAttributes } from 'react';
import '../styles/IconButton.css';
// Enums of the configs
export type IconButtonProps = {
    icon: string;
    size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
    colorStyle?: 'filled' | 'tonal' | 'outlined' | 'standard';
    label: string;
    disabled?: boolean;
} & HTMLAttributes<HTMLButtonElement>;


export default function IconButton({
    icon,
    size = 'small',
    colorStyle = 'standard',
    label,
    disabled = false,
    className,
    onClick,
    ...rest
}: IconButtonProps) {
    const classes = ['iconButton', size, colorStyle, className].filter(Boolean).join(' ');
    return (
        <button disabled={disabled} className={classes} onClick={onClick} {...rest}>
            <span className="material-symbols-outlined" title={label}>
                {icon}
            </span>
            <div className="stateLayer" />
        </button>
    );
}