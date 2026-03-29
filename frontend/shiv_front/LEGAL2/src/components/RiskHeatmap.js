import React from 'react';
import ClauseCard from './ClauseCard';

export default function RiskHeatmap({ clauses, selectedId, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {clauses.map((clause, i) => (
        <ClauseCard
          key={clause.id}
          clause={clause}
          index={i}
          isSelected={selectedId === clause.id}
          onClick={() => onSelect(clause)}
        />
      ))}
    </div>
  );
}
