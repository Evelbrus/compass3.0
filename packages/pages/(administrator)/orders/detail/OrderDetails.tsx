'use client';

import React, { useState, useEffect } from 'react';

interface Order {
  uuid: string;
  createdById: string;
  tariffUuid: string;
  departureTime: string;
  departurePointId: string;
  arrivalPointId: string;
  basePrice: number;
  status: string;
  assignedDriverId: string | null;
  intermediatePoints: string[];
  createdBy: {
    uuid: string;
    fullName: string;
    email: string;
    phone: string;
  };
  assignedDriver: {
    uuid: string;
    fullName: string;
    email: string;
    phone: string;
  } | null;
  tariff: {
    uuid: string;
    name: string;
    vehicleTypes: string;
  };
  departurePoint: {
    uuid: string;
    address: string;
    basePrice: number;
  };
  arrivalPoint: {
    uuid: string;
    address: string;
    basePrice: number;
  };
  orderTariffAdditionalServices: {
    uuid: string;
    tariffOnServiceUuid: string;
    createdAt: string;
    updatedAt: string;
    tariffOnService: {
      uuid: string;
      price: number;
      isAvailable: boolean;
      serviceUuid: string;
      createdAt: string;
      updatedAt: string;
      name: string;
    };
  }[];
}

const OrderDetails = ({ orderId }: { orderId: string }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.statusText}`);
        }
        const data = await response.json();
        setOrder(data);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div>Loading order details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2>Order Details</h2>
      <p>
        <strong>UUID:</strong> {order.uuid}
      </p>
      <p>
        <strong>Status:</strong> {order.status}
      </p>
      <p>
        <strong>Created By:</strong> {order.createdBy.fullName} ({order.createdBy.email})
      </p>
      {order.assignedDriver && (
        <p>
          <strong>Assigned Driver:</strong> {order.assignedDriver.fullName} (
          {order.assignedDriver.email})
        </p>
      )}
      <p>
        <strong>Tariff:</strong> {order.tariff.name} ({order.tariff.vehicleTypes})
      </p>
      <p>
        <strong>Departure Time:</strong> {new Date(order.departureTime).toLocaleString()}
      </p>
      <p>
        <strong>Departure Point:</strong> {order.departurePoint.address} (
        {order.departurePoint.basePrice})
      </p>
      <p>
        <strong>Arrival Point:</strong> {order.arrivalPoint.address} ({order.arrivalPoint.basePrice}
        )
      </p>

      {order.intermediatePoints && order.intermediatePoints.length > 0 && (
        <div>
          <strong>Intermediate Points:</strong>
          <ul>
            {order.intermediatePoints.map((point, index) => (
              <li key={index}> {point}</li>
            ))}
          </ul>
        </div>
      )}
      <p>
        <strong>Base Price:</strong> {order.basePrice}
      </p>

      {order.orderTariffAdditionalServices && order.orderTariffAdditionalServices.length > 0 && (
        <div>
          <strong>Additional Services:</strong>
          <ul>
            {order.orderTariffAdditionalServices.map((service) => (
              <li key={service.uuid}>
                {service.tariffOnService.name} ({service.tariffOnService.price})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
