import React from 'react';

export function CruiseView(props) {
  const { cruise, refresh } = props;

  return (
    <div>
      <p>Cruise:</p>
      <p>{JSON.stringify(cruise)}</p>

      <button type="button" onClick={refresh}>Refresh</button>
    </div>
  );
}
