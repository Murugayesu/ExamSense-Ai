
import React from 'react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const styles = {
    [Priority.HIGH]: "bg-red-100 text-red-700 border-red-200",
    [Priority.MEDIUM]: "bg-yellow-100 text-yellow-700 border-yellow-200",
    [Priority.LOW]: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[priority]}`}>
      {priority} Priority
    </span>
  );
};
