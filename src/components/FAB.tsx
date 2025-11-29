import '../styles/components/FAB.css';
export type FABProps = {
    types?: 'baseline' | 'large' | 'medium';
    color?: 'primary' | 'secondary' | 'tertiary'| 'tonalPrimary' |'tonalSecondary' | 'tonalTertiary' ;
    icon: string;
    text?: string;
    onClick?: () => void;
    plain?: boolean;
    expanded?: boolean;
};
export default function FAB({types = 'baseline', color = 'primary', icon, text, onClick, plain, expanded}: FABProps) {
    return (
        <button className={`fab ${types} ${color} ${text && 'extended'} ${plain && 'plain'} ${expanded && 'expanded'}`} onClick={onClick}>
            <span className="material-symbols-outlined">
                {icon}
            </span>
            <p>{text}</p>
            <div className="stateLayer"/>
        </button>
    );
}