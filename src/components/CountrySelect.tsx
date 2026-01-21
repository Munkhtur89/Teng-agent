import React from "react";

interface Country {
  id: string;
  name: string;
}

interface CountrySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  label?: string;
}

const countries: Country[] = [
  { id: "3", name: "Afghanistan" },
  { id: "6", name: "Albania" },
  { id: "62", name: "Algeria" },
  // Add more countries as needed
];

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  required = false,
  label = "Аялах улс",
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Сонгоно уу</option>
        {countries.map((country) => (
          <option key={country.id} value={country.id}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
};
