import { UserRole } from '@prisma/client';

export const users = Array.from({ length: 30 }, (_, index) => ({
  email: `user${index + 1}@example.com`,
  role: index % 5 === 0 ? UserRole.Admin : UserRole.Client,
  additional_info: {
    create: {
      full_name: `User ${index + 1}`,
      phone: `12345678${index}`,
      address: `Street ${index + 1}`,
      company: {
        create: {
          company_name: `Company ${index + 1}`,
          company_pin: `${index + 1000}`,
        },
      },
    },
  },
  driver_profile: {
    create: {
      status: index % 2 === 0 ? 'Active' : 'Inactive',
      driver_type: index % 3 === 0 ? 'Full-time' : 'Part-time',
      birthdate: new Date(`198${index % 10}-01-01`),
      birthplace: `City ${index + 1}`,
      passport_id: `P123456${index}`,
    },
  },
}));
