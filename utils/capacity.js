import DeliveryPerson from "../modules/storeAdmin/deliveryPerson.js";

export async function computeSlotCapacity(storeId) {
  const activeDPs = await DeliveryPerson.countDocuments({
    storeId,
    status: "Active",
    isAvailable: true,
  });
  return activeDPs * 3;
}
