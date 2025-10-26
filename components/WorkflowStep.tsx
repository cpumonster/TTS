
import React from 'react';

interface WorkflowStepProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const WorkflowStep: React.FC<WorkflowStepProps> = ({ icon, label, isActive, onClick }) => {
  const baseClasses = "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200";
  const activeClasses = "bg-purple-600/30 text-white font-semibold shadow-lg";
  const inactiveClasses = "text-gray-400 hover:bg-gray-700/50 hover:text-white";

  return (
    <div
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};
