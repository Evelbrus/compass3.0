import React from 'react';

interface OrderDetailsInputProps {
  flightNumber: string;
  description: string;
  onFlightNumberChange: (number: string) => void;
  onDescriptionChange: (text: string) => void;
}

const OrderDetailsInput: React.FC<OrderDetailsInputProps> = ({
  flightNumber,
  description,
  onFlightNumberChange,
  onDescriptionChange,
}) => (
  <div>
    <div>
      <label htmlFor="flightNumber">Номер рейса</label>
      <input
        type="text"
        id="flightNumber"
        value={flightNumber}
        onChange={(e) => onFlightNumberChange(e.target.value)}
      />
    </div>

    <div>
      <label htmlFor="description">Описание</label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
    </div>
  </div>
);

export default OrderDetailsInput;
