import React from 'react';

interface DepartureTimeInputProps {
  departureTime: string;
  onTimeChange: (time: string) => void;
}

const DepartureTimeInput: React.FC<DepartureTimeInputProps> = ({ departureTime, onTimeChange }) => (
  <div>
    <label htmlFor="departureTime">Время отправления</label>
    <input
      type="datetime-local"
      id="departureTime"
      value={departureTime}
      onChange={(e) => onTimeChange(e.target.value)}
    />
  </div>
);

export default DepartureTimeInput;