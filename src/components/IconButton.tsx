import '../styles/IconButton.css';
// Enums of the configs
export type IconButtonProps = {
    icon: string;
    size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
    colorStyle?: 'filled' | 'tonal' | 'outlined' | 'standard';
    onClick: () => void;
    label: string;
    disabled?: boolean;
};

export default function IconButton({ 
    icon, 
    onClick,
    size = 'small',
    colorStyle = 'standard',
    label,
    disabled = false,
}: IconButtonProps) {
    return (
        <button disabled={disabled} className={`iconButton ${size} ${colorStyle}`} onClick={onClick}>
            <span className="material-symbols-outlined"
            title={label}>
                {icon}
            </span>
            <div className="stateLayer"/>
        </button>
    );
}