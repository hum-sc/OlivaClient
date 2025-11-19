import type { Cell } from "../OlivaFormat/oli";

interface CellProps extends React.ComponentProps<'div'> {
    cell: Cell;
}


export default function Cell(props: CellProps){

    return <div {...props} contentEditable={true} className="cell">
        {props.cell.source}
    </div>
}