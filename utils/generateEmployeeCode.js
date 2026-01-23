const generateEmployeeCode = async (storeId) => {
  const lastEmp = await StoreEmployee
    .findOne({ storeId })
    .sort({ createdAt: -1 });

  if (!lastEmp || !lastEmp.employeeCode) return "EMP001";

  const lastNumber = parseInt(lastEmp.employeeCode.replace("EMP", "")) || 0;
  const nextNumber = (lastNumber + 1).toString().padStart(3, "0");

  return `EMP${nextNumber}`;
};
