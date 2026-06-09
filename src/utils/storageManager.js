// Storage Manager - Handles all local JSON data operations
const INVENTORY_KEY = 'billing_inventory';
const INVOICES_KEY = 'billing_invoices';

export const storageManager = {
  // Inventory Operations
  getInventory: () => {
    try {
      const data = localStorage.getItem(INVENTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading inventory:', error);
      return [];
    }
  },

  saveInventory: (inventory) => {
    try {
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
      return true;
    } catch (error) {
      console.error('Error saving inventory:', error);
      return false;
    }
  },

  addItem: (item) => {
    try {
      const inventory = storageManager.getInventory();
      const newSN = inventory.length > 0 ? Math.max(...inventory.map(i => i.sn || 0)) + 1 : 1;
      
      const newItem = {
        sn: newSN,
        item: item.item?.trim() || '',
        type: item.type?.trim() || '',
        category: item.category?.trim() || '',
        costPrice: parseFloat(item.costPrice) || 0,
        sellingPrice: parseFloat(item.sellingPrice) || 0,
        profit: (parseFloat(item.sellingPrice) || 0) - (parseFloat(item.costPrice) || 0),
        unitType: item.unitType?.trim() || 'Piece',
        weightPerUnit: parseFloat(item.weightPerUnit) || 0,
        createdAt: new Date().toISOString(),
      };
      
      inventory.push(newItem);
      storageManager.saveInventory(inventory);
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
      return null;
    }
  },

  updateItem: (sn, updatedData) => {
    try {
      const inventory = storageManager.getInventory();
      const index = inventory.findIndex(item => item.sn === sn);
      
      if (index > -1) {
        const newCostPrice = parseFloat(updatedData.costPrice) || inventory[index].costPrice;
        const newSellingPrice = parseFloat(updatedData.sellingPrice) || inventory[index].sellingPrice;
        
        inventory[index] = {
          ...inventory[index],
          ...updatedData,
          costPrice: newCostPrice,
          sellingPrice: newSellingPrice,
          profit: newSellingPrice - newCostPrice,
          updatedAt: new Date().toISOString(),
        };
        
        storageManager.saveInventory(inventory);
        return inventory[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating item:', error);
      return null;
    }
  },

  deleteItem: (sn) => {
    try {
      const inventory = storageManager.getInventory();
      const filtered = inventory.filter(item => item.sn !== sn);
      storageManager.saveInventory(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  },

  getItemBySN: (sn) => {
    try {
      const inventory = storageManager.getInventory();
      return inventory.find(item => item.sn === sn);
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  },

  getItemByName: (itemName) => {
    try {
      const inventory = storageManager.getInventory();
      return inventory.find(item => item.item.toLowerCase() === itemName.toLowerCase());
    } catch (error) {
      console.error('Error getting item by name:', error);
      return null;
    }
  },

  searchItems: (query) => {
    try {
      const inventory = storageManager.getInventory();
      return inventory.filter(item =>
        item.item.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  },

  filterByCategory: (category) => {
    try {
      const inventory = storageManager.getInventory();
      return inventory.filter(item => item.category === category);
    } catch (error) {
      console.error('Error filtering by category:', error);
      return [];
    }
  },

  filterByType: (type) => {
    try {
      const inventory = storageManager.getInventory();
      return inventory.filter(item => item.type === type);
    } catch (error) {
      console.error('Error filtering by type:', error);
      return [];
    }
  },

  getCategories: () => {
    try {
      const inventory = storageManager.getInventory();
      return [...new Set(inventory.map(item => item.category).filter(Boolean))].sort();
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  },

  getTypes: () => {
    try {
      const inventory = storageManager.getInventory();
      return [...new Set(inventory.map(item => item.type).filter(Boolean))].sort();
    } catch (error) {
      console.error('Error getting types:', error);
      return [];
    }
  },

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

  getInvoiceById: (invoiceNumber) => {
    try {
      const invoices = storageManager.getInvoices();
      return invoices.find(inv => inv.invoiceNumber === invoiceNumber);
    } catch (error) {
      console.error('Error getting invoice:', error);
      return null;
    }
  },

  exportInventory: () => {
    try {
      const inventory = storageManager.getInventory();
      const dataStr = JSON.stringify(inventory, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting inventory:', error);
    }
  },

  exportInvoices: () => {
    try {
      const invoices = storageManager.getInvoices();
      const dataStr = JSON.stringify(invoices, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoices_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting invoices:', error);
    }
  },

  importInventory: (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const inventory = JSON.parse(e.target.result);
            if (Array.isArray(inventory)) {
              storageManager.saveInventory(inventory);
              resolve(inventory);
            } else {
              reject(new Error('Invalid inventory format'));
            }
          } catch (error) {
            reject(new Error('Invalid JSON file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    });
  },

  clearAllData: () => {
    try {
      localStorage.removeItem(INVENTORY_KEY);
      localStorage.removeItem(INVOICES_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },
};