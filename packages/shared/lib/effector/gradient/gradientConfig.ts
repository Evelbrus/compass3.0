export const gradientConfig: Record<string, Record<string, string>> = {
  ORDERS: {
    PENDING: 'from-[#FFC10766] via-[#FFC1074C]',
    PLANNED: 'from-[#006DFB66] via-[#006DFB4D]',
    IN_PROGRESS: 'from-[#28A74566] via-[#28A7454D]',
    COMPLETED: 'from-[#8C00C666] via-[#8C00C64D]',
    CANCELLED: 'from-[#D9534F66] via-[#D9534F4D]',
    OVERDUE: 'from-[#6C757D66] via-[#6C757D4D]',
    RETURNED: 'from-[#17A2B866] via-[#17A2B84D]',
  },
  USERS: {
    Client: 'from-[#006DFB66] via-[#006DFB4D]',
    ClientCorp: 'from-[#FFC10766] via-[#FFC1074C]',
    Driver: 'from-[#28A74566] via-[#28A7454D]',
    Operator: 'from-[#8C00C666] via-[#8C00C64D]',
    Admin: 'from-[#D9534F66] via-[#D9534F4D]',
  },
  DEFAULT: {
    DEFAULT: 'from-[#efefef] via-[#efefef]',
  },
  // Добавляйте другие сущности здесь
};
