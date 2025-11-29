import { 
    Repo, 
    BroadcastChannelNetworkAdapter, 
    IndexedDBStorageAdapter,
    DocHandle,
    isValidAutomergeUrl
} from "@automerge/react"
import type { UUID } from "crypto"

type Metadata = {
    type: 'updated' | 'deleted',
    notebookID:UUID,
    owner_id?:UUID,
    title?: string,
    paper?: object,
    base_font_size?: number,
    body_font_family?: string,
    page_layout?: object,
    header_font_family?: object,
    created_at?: Date,
}

export type MetadataList = Metadata[];

export const initMetadataList = (): MetadataList => {
    return [{
        type: 'updated',
        notebookID: crypto.randomUUID() as UUID,
        title: 'Sample Notebook',
        created_at: new Date(),
    }];
}

export const useMetadataList : ()=>Promise<[Repo, DocHandle<MetadataList>]> = async () => {
    let handle :DocHandle<MetadataList>;
    let repo = new Repo({
        network: [new BroadcastChannelNetworkAdapter()],
        storage: new IndexedDBStorageAdapter(),
    })
    const locationHash = document.location.hash.substring(1);
    if (isValidAutomergeUrl(locationHash)) {
       handle = await repo.find(locationHash);
    } else{
        handle = repo.create<MetadataList>(initMetadataList());
        document.location.hash = handle.url;
    }

    return [repo, handle];
}

