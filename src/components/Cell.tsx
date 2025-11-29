import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import '../styles/components/Cell.css'


export default function CellComponent(){
    const placeholder = 'Escribe...'
    return( 
    <ContentEditable
        className="cell"
        aria-placeholder={placeholder}
        placeholder={
            <div
                className="editor-placeholder"
            >{placeholder}</div>
        }
    />);

}