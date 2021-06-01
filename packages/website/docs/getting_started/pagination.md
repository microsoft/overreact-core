---
id: pagination
title: Pagination 
---

## Pagination vs. Fetch

Pagination is used to describe how we request data from server incrementally. In a timeline view of a social media app, we'll always try to show the latest content while incrementally fetching older items, when users scroll down and wanted to see more.

Generally within overreact, pagination and fetch shares most of the common infrastructures to read data from server. However, pagination components maintain an internal state, where we record the location information of the latest batch requested, and provide users with a handler to request more items of the same batch size.

## Spec Requirement

Pagination in overreact shares the same specs with Fetch. However, because pagination can only work with a set of data, the pagination specs must have a response contract that is of type `COLL`.

## Usage

To setup pagination for our `People` entities, we'll use `usePagination` hook:

```jsx title="pagination.js"
function Pagination() {
    const dataRefId = useDataRefId();

    const variables = useMemo(() => ({
        locator: {
            descriptor: {},
        },

        // we'll request 5 items at a time
        pageSize: 5,
    }), []);

    const [{
        data,
        error,
    }, {
        isLoading,
        hasMore,
        loadMore,
    }] = usePagination(dataRefId, variables);

    const loadMorePeople = useCallback(() => {
        // only load more data when there's more on the server
        if (hasMore()) {
            loadMore();
        }
    }, [hasMore, loadMore]);

    return (
        <div>
            {data && data.map(people => <Text>{people.userName}</Text>)}
            { !isLoading && 
                <button onClick={loadMorePeople}>Load More</button>
            }
        </div>
    );
}
```


