import type { UUID } from "crypto"
import type { LayoutTemplate } from "../../components/Editor/LayoutPlugin/LayoutContainerNode";
export type Paper = {
    dimensions: {
        width: number,
        height: number,
        name: string
    },
    orientation: 'portrait' | 'landscape',
}

export type FontFamily = {
    name: string,
    generic_family: 'serif' | 'sans-serif' | 'monospace' | 'cursive' | 'fantasy' | 'system-ui',
    url?: string,
}

export type Metadata = {
    type: 'post' | 'deleted',
    notebookID:UUID,
    ownerId?:UUID,
    title?: string,
    paper?: Paper,
    baseFontSize?: number,
    bodyFontFamily?: FontFamily,
    pageLayout?: LayoutTemplate,
    headerFontFamily?: FontFamily,
    createdAt?: Date,
}

export type MetadataList = {
    title?: string,
    metadata: Metadata[],
};

export const initMetadataList = (): MetadataList => {
    return {
        title: 'Ejemplo',
        metadata: []
    };
}