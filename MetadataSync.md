# Synchronization of Metadata

We need to implement a robust system for synchronizing notebook metadata between the client and server. This includes handling offline modifications, conflict resolution, and ensuring data integrity.

Whe have 2 types of modifications that can be made to notebooks metadata while offline:
- Post
- Update

So it does not matter the order in which the modifications were made while offline, we always get the same result when syncing.

# Carachteristics of datatype
We need to achieve some charachteristics with the datatype that stores the offline modifications:

- Associative: 
$ a+b=b+a $ so it doesnot metter the order of the modifications, the result is the same.
- Commutative:
$(a+b)+c = a+(b+c)$ so it does not matter how we merge the modifications, the result is the same.
- Idempotent
$ a+a+a+b=a+b $ so applying the same modification multiple times does not change the result after the first application.

# Implementation Details
At first, the metadata is:
```json
{
    notebookID:UUID,
    owner_id:UUID,
    title: string,
    paper: object,
    base_font_size: number,
    body_font_familiy: string,
    page_layout: object,
    header_font_family: object,
    created_at: timestamp,
    updated_at: timestamp
}
```

so modification should be shown as:
```json
{
    id:Hash, // unique id for the modification
    type: 'updated' | 'deleted',
    notebookID:UUID,
    owner_id?:UUID,
    title?: string,
    paper?: object,
    base_font_size?: number,
    body_font_family?: string,
    page_layout?: object,
    header_font_family?: object,
    created_at?: timestamp,
    updated_at?: timestamp, // timestamp of the update
}
```
The ID hash gonna be the next data hashed through base64
```json
{
    type: 'updated' | 'deleted',
    notebookID:UUID,
    owner_id?:UUID,
    title?: string,
    paper?: object,
    base_font_size?: number,
    body_font_family?: string,
    page_layout?: object,
    header_font_family?: object,
    created_at?: timestamp,   
}
```
So It does not matter where the changes come from if it is the same change it will get the same id.

## How does it work

- **Partial Post**:
A partial post is only added if the metadata exists and there is no delete modification.

- **Full Post**:
If metadata does not exists, it is added, if exists, updates content, if a delete modification exists, it does not do any modification.

- **Delete**
If metadata does not exist, does not do any modification (neither store the modification), if it exist, then the modification is added

- **Post** 
A post update gonna be applyied ordered by the updete_at timestamp.

## Imagine

if we have two clients connected

|t| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Client 1 | A | ABC | AC | BCD | BCD |
| Client 2 | A | ABC | AC | BCD | BCD |
|Clout d| A | AB | ABC | BCD | BCD |

If then one is disconnected and still making changes

|t| 1 | 2 | 3 | 4 | 5 | 6|
|---|---|---|---|---|---|---|
| Client 1 | A |ABC | ABC | AC | BCD | BDE |
| Client 2 | A | ABC|AB | ABD | ABDE | BDE |


## DATA NEEDED TO HANDLE UPDATES
|field | content | timestamp |
|---|---|---|
| notebookID | | |
| owner_id | | |
| title | | |
| paper | | |
| base_font_size | | |
| body_font_family | | |
| page_layout | | |
| header_font_family | | |
| updated_at | | |

## Entonces mi tabla de metadata sera 

```json 
{
    notebookID:UUID,
    owner_id:UUID,
    title: string,
    paper: jsonb,
    base_font_size: number,
    body_font_familiy: string,
    page_layout: jsonb,
    header_font_family: string,
    created_at: timestamp,
    modification_info:jsonb
}
```
 dónde `modification_info` es un objeto que contiene la información de las modificaciones realizadas al notebook, con el siguiente formato:

 ```json
 {
    owner_id: timestamp
    title: timestamp,
    paper: timestamp,
    base_font_size: timestamp,
    body_font_familiy: timestamp,
    page_layout: timestamp,
    header_font_family: timestamp,
    created_at: timestamp,
    modification_timestamps:timestamp
    was_deleted: boolean
 }
 ```

 so, when a `Delete` is performed, the modification_info is updated with true;

if was_deleted is true we will ignore the register

When a `Post` is performed, if the modification timestamp is greater than the current timestamp the fields are updated and in the modification_info we set the new timestamp

