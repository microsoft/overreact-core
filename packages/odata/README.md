# `overreact-odata`

A typical usage of overreact within our team is to deal with [OData](https://www.odata.org/) from various service endpoints. Usually these endpoints already have pre-built schema packages available (such as `@bingads-webui/mca-odata-schemas`, and `@bingads-webui/campaign-odata-schemas`), from which we can extract useful information and generate overreact specs without having our developers write from scratch. Given each entity (e.g., `Activity`, `Ad`) have CRUD operations, as well as OData actions/functions attached, this could save a tremendous amount of manual effort.

## The Idea

To generate a spec for each OData model, we'll need to solve these problems:

1. How to create `dataPath` from OData model hierarchy.
2. How to assign proper "Key" values to each level on hierarchy.
3. How to identify from response which property is the "Key".

In overreact, the internal data structure ("store") is constructed from a schema tree, where each node has an associated `dataPath` to describe its location from root. Similarly, OData also organizes data using a tree-like structure, and provides navigation properties to locate specific data in the tree. 

Consider an OData GET request to fetch an `Activity`. The URL would look like this:

> GET https://contoso.com/Customers(123)/Accounts(456)/Activities('789')

We can directly map `dataPath` from EDM hierarchy to `customer:account:activity`.

For OData actions/functions, a call to `https://contoso.com/Customers(123)/Accounts(456)/Default.FooBar()` will map to `customer:account:foo_bar`. Note that we converted the Pascal naming to Snake convention, and discarded the namespace "Default" in this case.

The "Key" values are used to identify which entity to use on each level in the hierarchy. Currently in overreact we have 2 options to select keys:

1. Using `locator.order` in `variables`. For example:
```javascript
const variables = {
    locator: {
        order: ['cid', 'aid', 'activityId'],
        descriptor: { cid: 123, aid: 456, activityId: '789' },
    },
};
```

2. Using `parentKeySelector` in request contract.

Unfortunately `parentKeySelector` only provides "Key" info for current value, as well as its "parent" key values. We'll loose info for levels that are higher than 2, so in our case we'll resort to using `order`.

Finally, we need to identify the "Key" property value from OData responses, as they are used to look up cached items in overreact store. Luckily it is usually specified in `$$ODataExtension.Key` from the OData schemas. It is an array value but for now we'll only leverage the first one:

```javascript
const { $$ODataExtension } = entitySchema;

createResponseContract({
    // ...
    keySelector: r => r[$$ODataExtension.Key[0]],
})
```

## Usage

Due to length limit, please visit [Working with OData](https://microsoft.github.io/overreact-core/blog/odata) for details on usage.
