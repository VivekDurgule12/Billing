const INVOICES_KEY = 'billing_invoices';
const INVENTORY_API = '/api/inventory';

const normalizeNumber = (value) => {
  const number = parseFloat(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeInventory = (inventory) => inventory.map((item, index) => {
  const costPrice = normalizeNumber(item.costPrice);
  const sellingPrice = normalizeNumber(item.sellingPrice);

  return {
    sn: normalizeNumber(item.sn) || index + 1,
    item: item.item?.trim() || '',
    type: item.type?.trim() || '',
    category: item.category?.trim() || '',
    costPrice,
    sellingPrice,
    profit: sellingPrice - costPrice,
    unitType: item.unitType?.trim() || item.type?.trim() || 'Piece',
    weightPerUnit: normalizeNumber(item.weightPerUnit) || 1,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt,
  };
});

const requestInventory = async (method = 'GET', inventory) => {
  const response = await fetch(INVENTORY_API, {
    method,
    headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined,
    body: method === 'PUT' ? JSON.stringify(normalizeInventory(inventory)) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Inventory request failed (${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data) ? normalizeInventory(data) : [];
};

export const storageManager = {
  getInventory: async () => {
    try {
      return await requestInventory();
    } catch (error) {
      console.error('Error loading inventory:', error);
      return [];
    }
  },

  saveInventory: async (inventory) => {
    try {
      return await requestInventory('PUT', inventory);
    } catch (error) {
      console.error('Error saving inventory:', error);
      return null;
    }
  },

  seedDefaultInventory: async () => storageManager.getInventory(),

  addItem: async (item) => {
    try {
      const inventory = await storageManager.getInventory();
      const newSN = inventory.length > 0 ? Math.max(...inventory.map(i => i.sn || 0)) + 1 : 1;
      const costPrice = normalizeNumber(item.costPrice);
      const sellingPrice = normalizeNumber(item.sellingPrice);

      const newItem = {
        sn: newSN,
        item: item.item?.trim() || '',
        type: item.type?.trim() || '',
        category: item.category?.trim() || '',
        costPrice,
        sellingPrice,
        profit: sellingPrice - costPrice,
        unitType: item.unitType?.trim() || item.type?.trim() || 'Piece',
        weightPerUnit: normalizeNumber(item.weightPerUnit) || 1,
        createdAt: new Date().toISOString(),
      };

      await storageManager.saveInventory([...inventory, newItem]);
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
      return null;
    }
  },

  updateItem: async (sn, updatedData) => {
    try {
      const inventory = await storageManager.getInventory();
      const index = inventory.findIndex(item => item.sn === sn);

      if (index > -1) {
        const costPrice = normalizeNumber(updatedData.costPrice);
        const sellingPrice = normalizeNumber(updatedData.sellingPrice);

        inventory[index] = {
          ...inventory[index],
          ...updatedData,
          costPrice,
          sellingPrice,
          profit: sellingPrice - costPrice,
          unitType: updatedData.unitType?.trim() || updatedData.type?.trim() || inventory[index].unitType,
          weightPerUnit: normalizeNumber(updatedData.weightPerUnit) || 1,
          updatedAt: new Date().toISOString(),
        };

        await storageManager.saveInventory(inventory);
        return inventory[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating item:', error);
      return null;
    }
  },

  deleteItem: async (sn) => {
    try {
      const inventory = await storageManager.getInventory();
      await storageManager.saveInventory(inventory.filter(item => item.sn !== sn));
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  },

  getCategories: (inventory = []) => (
    [...new Set(inventory.map(item => item.category).filter(Boolean))].sort()
  ),

  getTypes: (inventory = []) => (
    [...new Set(inventory.map(item => item.type).filter(Boolean))].sort()
  ),

  saveInvoice: (invoice) => {
    try {
      const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]');
      const invoiceNumber = invoices.length > 0 ? Math.max(...invoices.map(i => i.invoiceNumber)) + 1 : 1001;

      const newInvoice = {
        invoiceNumber,
        ...invoice,
        createdAt: new Date().toISOString(),
      };

      invoices.push(newInvoice);
      localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
      return newInvoice;
    } catch (error) {
      console.error('Error saving invoice:', error);
      return null;
    }
  },

  getInvoices: () => {
    try {
      return JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]');
    } catch (error) {
      console.error('Error loading invoices:', error);
      return [];
    }
  },
};
