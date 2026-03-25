import React from 'react';
import '../styles/FilterBar.scss';


const FILTERS = [
  { id: 'all', label: 'All Items' },
  { id: 'web', label: 'Articles' },
  { id: 'youtube', label: 'Videos' },
  { id: 'twitte', label: 'Tweets' },
  { id: 'image', label: 'Images' },
  { id: 'pdf', label: 'PDFs' },
];

const FilterBar = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="filter-bar">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          className={`filter-pill ${activeFilter === f.id ? 'active' : ''}`}
          onClick={() => onFilterChange(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
