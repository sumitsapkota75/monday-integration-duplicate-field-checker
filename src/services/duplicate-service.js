const CheckDuplicateFieldValue = (allData) => {
  const phoneMap = new Map();
  // Filter the data to find items with duplicate phone numbers
  const duplicateItems = allData.filter((item) => {
    const { id, phone } = item;
    // Check if the phone number is already in the map
    if (phoneMap.has(phone)) {
      // Duplicate phone number found, return true
      return true;
    }
    // If not, add the phone number to the map
    phoneMap.set(phone, id);
    // No duplicate phone number found, return false
    return false;
  });
  const duplicateItemsIds = duplicateItems.map((item) => item.id);
  return duplicateItemsIds
};

module.exports = { CheckDuplicateFieldValue };
