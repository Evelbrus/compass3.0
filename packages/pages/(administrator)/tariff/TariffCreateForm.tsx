'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { AdditionalService, ServiceLevels, VehicleType } from '@prisma/client';
import { CreateTariffData } from '@shared/prisma/interface/tariff/interface';

interface FormData extends Omit<CreateTariffData, 'clientTypes' | 'vehicleType' | 'serviceLevel'> {
  vehicleType: VehicleType | undefined;
  serviceLevel: ServiceLevels | undefined;
  tariffAdditionalServices: {
    serviceUuid: string;
    price: number;
    isAvailable: boolean;
  }[];
}

const TariffCreateForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    vehicleType: undefined,
    description: '',
    price: 0,
    additionalPointPrice: 0,
    freeWaitTimeBishkek: 0,
    pricePerMinuteAfterBishkek: 0,
    freeWaitTimeAirport: 0,
    pricePerMinuteAfterAirport: 0,
    serviceLevel: undefined,
    tariffAdditionalServices: [],
  });

  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    //Fetch additional services
    fetch('/api/additional-services?page=1&per_page=100&sort_by=name&sort_order=asc')
      .then((response) => response.json())
      .then((data) => {
        const services = data.data.additionalServices;
        setAdditionalServices(services);
        //Initialize tariffAdditionalServices from fetched additional services
        setFormData((prevData) => ({
          ...prevData,
          tariffAdditionalServices: services.map((service) => ({
            serviceUuid: service.uuid,
            price: 0, //You can set a default price here if needed
            isAvailable: false,
          })),
        }));
      })
      .catch((error) => console.error('Error fetching additional services:', error));
  }, []);

  //Handle form input changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === 'number' ? (value ? Number(value) : 0) : type === 'checkbox' ? checked : value,
    }));
  };

  //Handle additional services input changes
  const handleAdditionalServicesChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value } = event.target;
    const newAdditionalServices = [...formData.tariffAdditionalServices];
    newAdditionalServices[index] = {
      ...newAdditionalServices[index],
      [name]: name === 'isAvailable' ? checked : Number(value),
    };

    setFormData((prevData) => ({
      ...prevData,
      tariffAdditionalServices: newAdditionalServices,
    }));
  };

  //Handle form submission
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    console.log('Form data:', formData);

    try {
      const response = await fetch('/api/tariffs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      setMessage(`Tariff created successfully: ${result.name}`);
    } catch (error) {
      setMessage(`Error creating tariff: ${(error as Error).message}`);
      console.error('There was an error creating the tariff!', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Tariff</h1>
      <section className="flex flex-col justify-center bg-white rounded-md">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
          <div className="mb-4 col-span-1">
            <label
              htmlFor="name"
              className=" block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px]"
            >
              Name:
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
              required
            />
          </div>
          <div>
            <label
              htmlFor="vehicleType"
              className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px]"
            >
              Vehicle Type:
            </label>
            <select
              className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
              id="vehicleType"
              value={formData.vehicleType}
              onChange={(e) =>
                setFormData({ ...formData, vehicleType: e.target.value as VehicleType })
              }
              required
            >
              <option value="">Select Vehicle Type</option>
              {Object.values(VehicleType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="description"
              className=" block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px]"
            >
              Description:
            </label>
            <input
              type="text"
              id="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className=" block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px]"
            >
              Price:
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
              required
            />
          </div>
          <div>
            <label
              htmlFor="additionalPointPrice"
              className=" block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px]"
            >
              Additional Point Price:
            </label>
            <input
              type="number"
              id="additionalPointPrice"
              value={formData.additionalPointPrice}
              onChange={handleInputChange}
              className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
              required
            />
          </div>
          <div>
            <label
              htmlFor="freeWaitTimeBishkek"
              className=" block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px]"
            >
              Free Wait Time Bishkek:
            </label>
            <input
              type="number"
              id="freeWaitTimeBishkek"
              value={formData.freeWaitTimeBishkek}
              onChange={handleInputChange}
              className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
              required
            />
          </div>
          <div>
            <label
              htmlFor="pricePerMinuteAfterBishkek"
              className=" block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px]"
            >
              Price Per Minute After Bishkek:
            </label>
            <input
              type="number"
              id="pricePerMinuteAfterBishkek"
              value={formData.pricePerMinuteAfterBishkek}
              onChange={handleInputChange}
              className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
              required
            />
          </div>
          <div>
            <label
              htmlFor="freeWaitTimeAirport"
              className=" block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px]"
            >
              Free Wait Time Airport:
            </label>
            <input
              type="number"
              id="freeWaitTimeAirport"
              value={formData.freeWaitTimeAirport}
              onChange={handleInputChange}
              className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
              required
            />
          </div>
          <div>
            <label
              htmlFor="pricePerMinuteAfterAirport"
              className=" block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px]"
            >
              Price Per Minute After Airport:
            </label>
            <input
              type="number"
              id="pricePerMinuteAfterAirport"
              value={formData.pricePerMinuteAfterAirport}
              onChange={handleInputChange}
              className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
              required
            />
          </div>
          <div>
            <label
              htmlFor="serviceLevel"
              className=" block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px]"
            >
              Service Level:
            </label>
            <select
              id="serviceLevel"
              value={formData.serviceLevel}
              className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
              onChange={(e) =>
                setFormData({ ...formData, serviceLevel: e.target.value as ServiceLevels })
              }
              required
            >
              <option value="">Select Service Level</option>
              {Object.values(ServiceLevels).map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="rounded-lg mb-4 bg-white border border-gray-300">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 rounded-t-lg"
              >
                <h2 className="text-2xl font-bold text-gray-700">Additional Services</h2>
                <span
                  className={`transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                >
                  ▼
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-700 ease-in-out ${
                  isOpen ? 'max-h-screen' : 'max-h-0'
                }`}
              >
                <div className="p-4 bg-white border-t border-gray-300">
                  {formData.tariffAdditionalServices.map((additionalService, index) => (
                    <div key={index}>
                      <label className=" block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px]">
                        {
                          additionalServices.find(
                            (service) => service.uuid === additionalService.serviceUuid,
                          )?.name
                        }
                      </label>
                      <div className="flex items-center gap-[12px]">
                        <input
                          type="number"
                          name="price"
                          className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
                          value={additionalService.price}
                          onChange={(e) =>
                            handleAdditionalServicesChange(
                              index,
                              e as ChangeEvent<HTMLInputElement>,
                            )
                          }
                          required
                        />
                        <label className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]">
                          <input
                            type="checkbox"
                            name="isAvailable"
                            checked={additionalService.isAvailable}
                            className="w-[18px] h-[18px] bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
                            onChange={(e) =>
                              handleAdditionalServicesChange(
                                index,
                                e as ChangeEvent<HTMLInputElement>,
                              )
                            }
                          />
                          Available
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#2A3037] rounded-[8px] font-inter font-normal text-[17px] leading-[20.57px] p-[10px] text-white h-fit"
          >
            Create Tariff
          </button>
        </form>
      </section>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TariffCreateForm;
