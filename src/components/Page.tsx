import { useSelector } from "react-redux";
import type { Page } from "../OlivaFormat/oli";
import '../styles/Page.css';
import type { RootState } from "../store";
import CellComponent from "./Cell";
interface PageProps extends React.PropsWithChildren {
    // Define any props needed for the Page component here
    page: Page;
}
export default function Page(props: PageProps){
    const notebookMetadata = useSelector((state:RootState) => state.editor.metadata);
    const heightPX = useSelector((state:RootState) => state.editor.notebookPixelsHeight);
      
    return (<div className="page" id={props.page.id}
        style={{
            gridTemplateColumns: `repeat(${notebookMetadata ? notebookMetadata.page_layout!.columns!:3}, 1fr)`,
            gridTemplateRows: `repeat(${notebookMetadata ? notebookMetadata.page_layout!.rows!:8}, 1fr)`,
            minHeight: `${heightPX}px`,
            height: `${heightPX}px`,
        }}
    >
        <section className="cue"
        style={{
            gridColumn: `span ${notebookMetadata ? notebookMetadata.page_layout!.cue_section!.columns!:2}`,
            gridRow: `span ${notebookMetadata ? notebookMetadata.page_layout!.cue_section!.rows!:1}`,
        }}
        >
            {props.page.cue?.cells.length === 1 && <p className="cell placeholder">No cue cells</p>}
            {
                props.page.cue?.cells.map((cell, index) => (
                    <CellComponent key={index} className="cell" cell={cell}/>
                ))
            }
        </section>
        <section className="content"
        style={{
            gridColumn: `span ${notebookMetadata ? notebookMetadata.page_layout!.content_section!.columns!:3}`,
            gridRow: `span ${notebookMetadata ? notebookMetadata.page_layout!.content_section!.rows!:6}`,
        }}
        >
            {
                props.page.content?.cells.map((cell, index) => (
                    <CellComponent key={index} className="cell" cell={cell} />
                ))
            }
        </section>
        <section className="summary"
        style={{
            gridColumn: `span ${notebookMetadata ? notebookMetadata.page_layout!.summary_section!.columns!:3}`,
            gridRow: `span ${notebookMetadata ? notebookMetadata.page_layout!.summary_section!.rows!:1}`,
        }}
        >
            {
                props.page.summary?.cells.map((cell, index) => (
                   <CellComponent key={index} className="cell" cell={cell} />
                ))
            }
        </section>
    </div>
    );
}