
import React from 'react';
import type { Persona } from '../types';

interface PersonaSettingsProps {
  personas: Persona[];
}

export const PersonaSettings: React.FC<PersonaSettingsProps> = ({ personas }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-md font-semibold text-purple-400 mb-3">Voice Personas</h3>
      <div className="space-y-3">
        {personas.map(persona => (
          <div key={persona.id} className="flex items-center space-x-3">
            <img src={persona.avatar} alt={persona.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-sm">{persona.name}</p>
              <p className="text-xs text-gray-400">{persona.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
