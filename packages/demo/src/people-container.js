import React, { useMemo } from 'react';
import { 
    useFetch,
    useDataRefId,
} from '@microsoft/overreact';

import { peopleSpec } from './people-spec';
import { PeopleView } from './people-view';

export function PeopleContainer(props) {
    const { userName } = props;
    const dataRefId = useDataRefId();

    const variables = useMemo(() => ({
        locator: {
            descriptor: { people: userName },
            order: ['people'],
        },
    }), [userName]);

    const [data] = useFetch(dataRefId, peopleSpec, variables);

    return (data ? <PeopleView 
        firstName={data.FirstName}
        lastName={data.LastName}
        address={data.AddressInfo[0]}
    /> : null);
}