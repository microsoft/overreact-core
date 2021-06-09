import React from 'react';

export function PeopleView(props) {
    const { firstName, lastName, address } = props;
    const { Address } = address;

    return (
        <div className="people-view">
            <span>{`${firstName} ${lastName}`}</span>
            <span>{Address}</span>
        </div>
    );
}
